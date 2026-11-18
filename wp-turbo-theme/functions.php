<?php

function osk_turbo_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
}
add_action('after_setup_theme', 'osk_turbo_theme_setup');

function osk_turbo_theme_assets() {
    $theme_version = wp_get_theme()->get('Version');
    $theme_uri = get_theme_file_uri();
    $theme_path = get_theme_file_path();

    wp_enqueue_style(
        'osk-turbo-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Manrope:wght@700;800&display=swap',
        array(),
        null
    );
    wp_enqueue_style(
        'osk-turbo-theme',
        $theme_uri . '/style.css',
        array('osk-turbo-fonts'),
        file_exists($theme_path . '/style.css') ? filemtime($theme_path . '/style.css') : $theme_version
    );

    wp_enqueue_script('osk-turbo-lucide', 'https://unpkg.com/lucide@latest', array(), null, true);
    wp_enqueue_script(
        'osk-turbo-script',
        $theme_uri . '/script.js',
        array('osk-turbo-lucide'),
        file_exists($theme_path . '/script.js') ? filemtime($theme_path . '/script.js') : $theme_version,
        true
    );
}
add_action('wp_enqueue_scripts', 'osk_turbo_theme_assets');
