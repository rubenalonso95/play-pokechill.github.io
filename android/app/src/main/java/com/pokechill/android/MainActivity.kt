package com.pokechill.android

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.JsResult
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

/**
 * PokeChill — offline shell.
 *
 * Serves the bundled HTML/JS/CSS game from the APK's assets via
 * WebViewAssetLoader (https://appassets.androidplatform.net/...) so that:
 *  - no external/local server is required,
 *  - relative paths, fetch() and localStorage behave like on a real origin,
 *  - the game is fully offline (no INTERNET permission + network blocked).
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    /** Pending <input type="file"> request coming from the WebView (game "Import Data"). */
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    /** Opens the native file picker and hands the chosen Uri back to the WebView. */
    private val openFilePicker =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val uri = result.data?.data
            if (uri != null) fileChooserCallback?.onReceiveValue(arrayOf(uri))
            else fileChooserCallback?.onReceiveValue(null) // user cancelled
            fileChooserCallback = null
        }

    /** JSON payload waiting for the user to pick a location (SAF "Create document"). */
    private var pendingExportContent: String? = null

    /** True while the native save-as picker is open (guards re-entrance). */
    private var exportPickerOpen = false

    /** Android's "Save as…" dialog (ACTION_CREATE_DOCUMENT) for Export Data. */
    private val createExportDocument =
        registerForActivityResult(
            ActivityResultContracts.CreateDocument("application/json")
        ) { uri ->
            exportPickerOpen = false
            val content = pendingExportContent
            pendingExportContent = null
            if (uri == null || content == null) return@registerForActivityResult // cancelled
            writeJsonToUri(uri, content)
        }

    private val assetLoader: WebViewAssetLoader by lazy {
        WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)

        webView.settings.apply {
            javaScriptEnabled = true
            // Persist localStorage["gameData"] across app restarts / device reboots.
            domStorageEnabled = true
            // Hard offline: the WebView must not touch the network at all.
            blockNetworkLoads = true
            // Only bundled assets are reachable.
            allowFileAccess = false
            allowContentAccess = false
            // The game is fully local; no cache/revalidation needed.
            cacheMode = WebSettings.LOAD_NO_CACHE
        }

        webView.webViewClient = object : WebViewClientCompat() {

            // Serve every request from the bundled assets; nothing else is reachable.
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? =
                assetLoader.shouldInterceptRequest(request.url)

            // Block any navigation outside the bundled game origin (e.g. Discord).
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean = request.url.host != HOST_APPASSETS
        }

        webView.webChromeClient = object : WebChromeClient() {

            // Native bridge for the <input type="file"> created by save.js importData().
            override fun onShowFileChooser(
                view: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                // Cancel any previous pending request before starting a new one.
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback ?: return false

                val intent = fileChooserParams?.createIntent() ?: return false
                // Unfiltered chooser: Android file managers often hide ".json" files
                // when the accept type is "application/json". save.js already validates
                // the file with JSON.parse, so `*/*` keeps the flow working in every picker.
                // No storage permission is needed (Storage Access Framework) and the app
                // stays fully offline (no INTERNET permission).
                intent.type = "*/*"
                openFilePicker.launch(intent)
                return true
            }

            // Restore the game's alert() dialogs (tutorial, save messages, import errors).
            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String,
                result: JsResult
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setCancelable(false)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ -> result.confirm() }
                    .show()
                return true
            }
        }

        // Native bridge used by the game's exportData() on this origin only.
        // Exposes a single save operation; the user confirms every file via SAF.
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        setContentView(webView)

        webView.loadUrl("https://$HOST_APPASSETS/assets/pokechill/index.html")
    }

    /** Called from JS (AndroidBridge.saveJson) on the JavaBridge thread. */
    private fun requestJsonExport(filename: String, content: String) {
        runOnUiThread {
            // Ignore a new request while the previous picker is still open.
            if (exportPickerOpen) return@runOnUiThread
            pendingExportContent = content
            exportPickerOpen = true
            createExportDocument.launch(filename)
        }
    }

    /** Writes the exported JSON to the picked document (off the main thread). */
    private fun writeJsonToUri(uri: Uri, content: String) {
        Thread {
            var success = false
            try {
                contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(content.toByteArray(Charsets.UTF_8))
                    success = true
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error writing exported save", e)
            }
            runOnUiThread {
                val msg = if (success) "Save exported" else "Export failed"
                Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
            }
        }.start()
    }

    /**
     * Bridge exposed to the game's JavaScript while the game runs in this WebView.
     *
     * Security: it only stores the payload and opens Android's document picker
     * (ACTION_CREATE_DOCUMENT). It executes no code, reads no resources and
     * never opens URLs; every write is user-confirmed via the system picker.
     */
    private inner class AndroidBridge {

        @JavascriptInterface
        @Suppress("UNUSED_PARAMETER") // mimeType mirrors the web export contract (always "application/json")
        fun saveJson(filename: String, mimeType: String, content: String) {
            // mimeType is always "application/json" today (the launcher is
            // registered with that type); it stays in the signature to mirror
            // the web version's export contract.
            requestJsonExport(filename, content)
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private companion object {
        const val TAG = "PokeChill"
        const val HOST_APPASSETS = "appassets.androidplatform.net"
    }
}