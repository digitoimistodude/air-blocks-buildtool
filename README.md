> [!NOTE]
> **WIP Notice:** This tool is currently in early testing version and we are planning to improve the [air-blocks](https://github.com/digitoimistodude/air-blocks) workflow with more native approach while retaining coding blocks via [ACF](https://www.advancedcustomfields.com/) and [PHP](https://www.php.net/).

# A native Air-blocks build tool
[![GitHub release](https://img.shields.io/github/tag/digitoimistodude/air-blocks-buildtool.svg?style=flat-square)](https://github.com/digitoimistodude/air-blocks-buildtool/releases) ![GitHub contributors](https://img.shields.io/github/contributors/digitoimistodude/air-blocks-buildtool.svg?style=flat-square)

Build native WordPress blocks using PHP without having to leave your editor (WIP).

## Requirements

- [Bun](https://bun.sh)

## Getting started (WIP-alpha)

1. Get [air-blocks/buildtool branch](https://github.com/digitoimistodude/air-blocks/tree/buildtool) to your Projects directory (you can just clone teh repo and checkout branch)
2. Clone this repo to $HOME/Projects/air-blocks-buildtool
3. Run newblock, build your new block with `+` (plus) icon
4. Install global bun with `npm install bun --global`
5. Cd in to your theme directory
6. Run:

```bash
bun $HOME/Projects/air-blocks-buildtool/src/index.js build
```

7. Add to the end of your functions.php:

```php
/**
 * Register air-blocks-buildtool blocks
 */
add_action('init', function() {
  register_block_type( __DIR__ . '/blocks/content-image/block.json' );
});
```

8. Allow all blocks in your functions.php allowed_block section if you're using [air-light](https://github.com/digitoimistodude/air-light).
9. Block should now show up in the editor

## What this tool is for

This tool is designed for [air-light](https://github.com/digitoimistodude/air-light), but can be used with any WordPress theme. You just need to configure the input and output directories respectively.

By default, the tool looks for \*.block.php files in the `template-parts/blocks` directory and generates blocks to `blocks/` directory. Blocks are generated like this: `template-parts/blocks/test.block.php` -> `blocks/test/block.json`. You can register the block using `register_block_type( __DIR__ . "/blocks/<block name>/block.json" )` in functions.php.

Blocks are configured with a comment header (similar to themes or plugins), like this:

```php
<?php
/**
 * Title:             Test block
 * Category:          air-blocks
 * Description:       Example block
 * Icon:              star
 */

register_attribute( 'test', 'Test value', 'string', 'Default value' );
register_attribute( 'show_test', 'Show test', 'boolean', false );
register_attribute( 'epic_image', 'Image', 'image', 0 );
register_attribute( 'select_option', 'Select option', 'enum', 'option-2', [
  'option-1' => 'Option 1',
  'option-2' => 'Option 2',
  'option-3' => 'Option 3',
] );
register_rich_text( 'title' );
register_rich_text( 'description', 'Default description' );
?>
<section class="block block-testi">
  <h1 wp-rich="title" wp-placeholder="Rich text title placeholder"><?php echo attr('title'); ?></h1>
  <h2><?php echo attr('test'); ?></h2>

  <!-- Use wp-rich-formats to specify allowed formats, default none. -->
  <!-- Separated by a comma, no spaces. If a namespace (namespace/format) is not specified, by default using core -->
  <p wp-rich="description" wp-rich-formats="bold,italic,code,image,text-color,link,keyboard"><?php echo attr('description'); ?></p>

  <?php if (attr('show_test')) : ?>
    <p>Test showing</p>
  <?php endif; ?>

  <?php native_lazyload_tag( attr( 'epic_image' ) ); ?>

  <!-- Use wp-allowed-blocks to specify allowed blocks, default all. -->
  <!-- Separated by a comma, no spaces. If a namespace (namespace/block) is not specified, by default using core -->
  <InnerBlocks wp-allowed-blocks="paragraph" />
</section>
```

To install dependencies, run `bun install`.

To build the blocks, run `bun /path/to/repository/src/index.js build` in the theme directory.

## Overriding generated block.json values

You can override block.json values by creating a `template-parts/blocks/<block>.block.json` file. You can just use the values you want to override:

```json
{
  "title": "Hello world!",
  "attributes": {
    "test": {
      "default": "Overridden default value"
    }
  }
}
```

## .blocktoolrc.json configuration file

You can override any value specified in src/config.js

- inputDir: The directory where the tool searches for .php files
- outputDir: The directory where blocks are generated to into subdirectories (inputDir/test.php -> outputDir/test/block.json)
