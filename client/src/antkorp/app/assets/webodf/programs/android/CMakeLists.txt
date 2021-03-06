set(ANDROID_JAR ${ANDROID_SDK_DIR}/platforms/android-8/android.jar)

COPY_FILES(APKDEPS ${CMAKE_SOURCE_DIR}/programs/touchui
    ${CMAKE_CURRENT_BINARY_DIR}/assets/www ${HTML5UIFILES})
COPY_FILES(APKDEPS ${CMAKE_CURRENT_SOURCE_DIR}/assets/www
    ${CMAKE_CURRENT_BINARY_DIR}/assets/www
    index.html icon.png cordova-1.8.0.js nativezip.js)
COPY_FILES(APKDEPS ${CMAKE_CURRENT_SOURCE_DIR}/res
    ${CMAKE_CURRENT_BINARY_DIR}/res
    drawable-hdpi/ic_launcher.png drawable-ldpi/ic_launcher.png
    drawable/icon.png drawable-mdpi/ic_launcher.png values/strings.xml
    xml/phonegap.xml xml/plugins.xml layout/selector.xml
    layout/main.xml layout/listitem.xml menu/main.xml)
COPY_FILES(APKDEPS ${CMAKE_CURRENT_SOURCE_DIR} ${CMAKE_CURRENT_BINARY_DIR}
    src/org/webodf/WebODFActivity.java
    src/org/webodf/ZipReader.java
    src/org/webodf/Base64OutputStream.java
    libs/cordova-1.8.0.jar
    AndroidManifest.xml
    .classpath .project)
COPY_FILES(APKDEPS ${CMAKE_BINARY_DIR}/webodf
    ${CMAKE_CURRENT_BINARY_DIR}/assets/www webodf.js)

set(WEBODFAPK ${CMAKE_CURRENT_BINARY_DIR}/bin/WebODF-debug.apk)
add_custom_command(
    OUTPUT ${WEBODFAPK}
    COMMAND ${ANDROID_SDK_DIR}/tools/android
        ARGS update project --path . --target android-7 --name WebODF
    COMMAND ${ANT}
        ARGS -lib ${CMAKE_CURRENT_SOURCE_DIR}/libs/cordova-1.8.0.jar debug
    DEPENDS ${APKDEPS}
    WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
)
add_custom_target(apk ALL DEPENDS ${WEBODFAPK})
set(WEBODFRELEASEAPK ${CMAKE_CURRENT_BINARY_DIR}/bin/WebODF-release.apk)
add_custom_command(
    OUTPUT ${WEBODFRELEASEAPK}
    COMMAND ${ANT}
        ARGS -lib ${CMAKE_CURRENT_SOURCE_DIR}/libs/cordova-1.8.0.jar release
    DEPENDS ${WEBODFAPK} webodf.js
    WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
)
add_custom_target(releaseapk ALL DEPENDS ${WEBODFRELEASEAPK})
