plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.pokechill.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.pokechill.android"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }
}

dependencies {
    // WebViewAssetLoader: serves the bundled game from assets/ under a local origin.
    implementation("androidx.webkit:webkit:1.12.1")
    // ComponentActivity + Activity Result API for the native file chooser (Import Data).
    implementation("androidx.activity:activity:1.9.3")
}