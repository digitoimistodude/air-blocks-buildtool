<?php
// WP Block Builder "framework"
function register_attribute( $key, $name, $type, $defaultValue ) {}

global $get_attribute_local_scope;
$get_attribute_local_scope = function ( $key ) use ( $attributes ) {
  if ( ! isset( $attributes[$key] ) ) {
    return "";
  }
  return $attributes[$key];
};

function attr( $key ) {
  global $get_attribute_local_scope;
  return $get_attribute_local_scope( $key );
}
// End WP Block Builder "framework"
?>