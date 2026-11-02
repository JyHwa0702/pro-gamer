import os
import subprocess
import shutil
import zipfile

def build_aab():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    unity_android = r"C:\Program Files\Unity\Hub\Editor\6000.3.14f1\Editor\Data\PlaybackEngines\AndroidPlayer"
    sdk = os.path.join(unity_android, "SDK")
    bt = os.path.join(sdk, "build-tools", "36.0.0")
    android_jar = os.path.join(sdk, "platforms", "android-35", "android.jar")
    
    jdk_bin = r"C:\Program Files\Java\jdk-17\bin"
    java_exe = os.path.join(jdk_bin, "java.exe")
    javac = os.path.join(jdk_bin, "javac.exe")
    keytool = os.path.join(jdk_bin, "keytool.exe")
    jarsigner = os.path.join(jdk_bin, "jarsigner.exe")
    
    aapt2 = os.path.join(bt, "aapt2.exe")
    d8_jar = os.path.join(bt, "lib", "d8.jar")
    bundletool = os.path.join(unity_android, "Tools", "bundletool-all-1.17.2.jar")

    work_dir = os.path.join(BASE_DIR, "aab_build_tmp")
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir, ignore_errors=True)
    os.makedirs(work_dir, exist_ok=True)

    src_dir = os.path.join(work_dir, "src", "com", "progamer", "road")
    res_dir = os.path.join(work_dir, "res")
    values_dir = os.path.join(res_dir, "values")
    mipmap_dir = os.path.join(res_dir, "mipmap")
    assets_dir = os.path.join(work_dir, "assets")
    gen_dir = os.path.join(work_dir, "gen")
    bin_dir = os.path.join(work_dir, "bin")

    os.makedirs(src_dir, exist_ok=True)
    os.makedirs(values_dir, exist_ok=True)
    os.makedirs(mipmap_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(gen_dir, exist_ok=True)
    os.makedirs(bin_dir, exist_ok=True)

    # 1. AndroidManifest.xml
    manifest_path = os.path.join(work_dir, "AndroidManifest.xml")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.progamer.road"
    android:versionCode="10"
    android:versionName="2.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="35" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="켠김에 GOAT까지"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>''')

    # 2. strings.xml
    with open(os.path.join(values_dir, "strings.xml"), "w", encoding="utf-8") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">켠김에 GOAT까지</string>
</resources>''')

    # 3. Copy app icon
    src_192 = os.path.join(BASE_DIR, "icon-192.png")
    if not os.path.exists(src_192):
        src_192 = os.path.join(BASE_DIR, "assets", "icon-192.png")
    shutil.copy(src_192, os.path.join(mipmap_dir, "ic_launcher.png"))
    shutil.copy(src_192, os.path.join(mipmap_dir, "ic_launcher_round.png"))

    # 4. MainActivity.java
    java_file = os.path.join(src_dir, "MainActivity.java")
    with open(java_file, "w", encoding="utf-8") as f:
        f.write('''package com.progamer.road;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
''')

    # 5. Copy web assets into assets/
    shutil.copy(os.path.join(BASE_DIR, "index.html"), os.path.join(assets_dir, "index.html"))
    assets_src = os.path.join(BASE_DIR, "assets")
    if os.path.exists(assets_src):
        shutil.copytree(assets_src, os.path.join(assets_dir, "assets"), dirs_exist_ok=True)
        for img in os.listdir(assets_src):
            img_p = os.path.join(assets_src, img)
            if os.path.isfile(img_p):
                shutil.copy(img_p, os.path.join(assets_dir, img))

    champs_src = os.path.join(BASE_DIR, "champs")
    if os.path.exists(champs_src):
        shutil.copytree(champs_src, os.path.join(assets_dir, "champs"), dirs_exist_ok=True)

    # 6. AAPT2 Compile
    compiled_res = os.path.join(work_dir, "compiled_res.zip")
    cmd_compile = [aapt2, "compile", "--dir", res_dir, "-o", compiled_res]
    res = subprocess.run(cmd_compile, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"aapt2 compile failed: {res.stderr}")

    # 7. AAPT2 Link with --proto-format for Android App Bundle (AAB)
    proto_apk = os.path.join(bin_dir, "proto.apk")
    cmd_link_proto = [
        aapt2, "link",
        "-I", android_jar,
        "-o", proto_apk,
        "--manifest", manifest_path,
        "--java", gen_dir,
        "--proto-format",
        compiled_res,
        "--auto-add-overlay"
    ]
    res = subprocess.run(cmd_link_proto, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"aapt2 proto link failed: {res.stderr}")

    # 8. Javac
    r_java = os.path.join(gen_dir, "com", "progamer", "road", "R.java")
    cmd_javac = [
        javac,
        "-cp", android_jar,
        "-d", bin_dir,
        "-source", "1.8",
        "-target", "1.8",
        java_file,
        r_java
    ]
    res = subprocess.run(cmd_javac, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"javac failed: {res.stderr}")

    # 9. D8 (DEX Compiler)
    class_files = []
    for root, dirs, files in os.walk(bin_dir):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(root, f))

    cmd_d8 = [
        java_exe, "-cp", d8_jar, "com.android.tools.r8.D8",
        "--lib", android_jar,
        "--output", bin_dir
    ] + class_files
    res = subprocess.run(cmd_d8, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"d8 failed: {res.stderr}")

    # 10. Prepare base.zip for bundletool
    # Extract proto.apk
    proto_extracted = os.path.join(work_dir, "proto_extracted")
    os.makedirs(proto_extracted, exist_ok=True)
    with zipfile.ZipFile(proto_apk, "r") as z:
        z.extractall(proto_extracted)

    # Structure required for base module zip:
    # manifest/AndroidManifest.xml
    # res/
    # resources.pb
    # dex/classes.dex
    # assets/
    base_module_dir = os.path.join(work_dir, "base_module")
    os.makedirs(os.path.join(base_module_dir, "manifest"), exist_ok=True)
    os.makedirs(os.path.join(base_module_dir, "dex"), exist_ok=True)
    os.makedirs(os.path.join(base_module_dir, "assets"), exist_ok=True)

    # Manifest
    shutil.copy(os.path.join(proto_extracted, "AndroidManifest.xml"), os.path.join(base_module_dir, "manifest", "AndroidManifest.xml"))
    # Resources table
    if os.path.exists(os.path.join(proto_extracted, "resources.pb")):
        shutil.copy(os.path.join(proto_extracted, "resources.pb"), os.path.join(base_module_dir, "resources.pb"))
    # Res dir
    if os.path.exists(os.path.join(proto_extracted, "res")):
        shutil.copytree(os.path.join(proto_extracted, "res"), os.path.join(base_module_dir, "res"))
    # Classes dex
    classes_dex = os.path.join(bin_dir, "classes.dex")
    shutil.copy(classes_dex, os.path.join(base_module_dir, "dex", "classes.dex"))
    # Assets
    for root, dirs, files in os.walk(assets_dir):
        for f in files:
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, assets_dir)
            target_p = os.path.join(base_module_dir, "assets", rel_p)
            os.makedirs(os.path.dirname(target_p), exist_ok=True)
            shutil.copy(full_p, target_p)

    # Zip base module into base.zip
    base_zip = os.path.join(work_dir, "base.zip")
    with zipfile.ZipFile(base_zip, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(base_module_dir):
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, base_module_dir)
                z.write(full_p, rel_p)

    # 11. Run bundletool to build AAB
    raw_aab = os.path.join(work_dir, "pro-gamer-unsigned.aab")
    cmd_bundle = [
        java_exe, "-jar", bundletool, "build-bundle",
        "--modules", base_zip,
        "--output", raw_aab
    ]
    res = subprocess.run(cmd_bundle, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"bundletool build-bundle failed: {res.stderr}")

    # 12. Sign AAB with jarsigner
    keystore = os.path.join(BASE_DIR, "keystore", "progamer-release.jks")
    final_aab = os.path.join(BASE_DIR, "pro-gamer.aab")
    shutil.copy(raw_aab, final_aab)

    cmd_jarsign = [
        jarsigner,
        "-keystore", keystore,
        "-storepass", "proroad2026!",
        "-keypass", "proroad2026!",
        final_aab,
        "progamerkey"
    ]
    res = subprocess.run(cmd_jarsign, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"jarsigner sign AAB failed: {res.stderr}")

    # 13. Validate AAB using bundletool
    cmd_validate = [
        java_exe, "-jar", bundletool, "validate",
        "--bundle", final_aab
    ]
    res = subprocess.run(cmd_validate, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"bundletool validate failed: {res.stderr}")

    # Copy to artifact directory
    artifact_dir = r"C:\Users\livm2\.gemini\antigravity\brain\36ca6a7a-bcec-45de-bcf4-52e501097eee"
    if os.path.exists(artifact_dir):
        shutil.copy(final_aab, os.path.join(artifact_dir, "pro-gamer.aab"))

    try:
        shutil.rmtree(work_dir, ignore_errors=True)
    except:
        pass

    aab_size = os.path.getsize(final_aab)
    print(f"SUCCESS: Generated validated, signed Google Play AAB at {final_aab} ({aab_size / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    build_aab()
