<?php
// This runner is used to generate PHP for HTML attribute scanning
error_reporting(0);  

$attributes = [];

function register_attribute( $key, $name, $type, $defaultValue ) {
  global $attributes;
  $attributes[$key] = $defaultValue;
}

function attr( $key ) {
  global $attributes;
  if ( ! isset( $attributes[$key] ) ) {
    return "";
  }
  return $attributes[$key];
}

include_once $argv[1];