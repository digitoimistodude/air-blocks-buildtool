# air-blocks-buildtool

Build native WordPress blocks using PHP without having to leave your editor (WIP).

## Requirements

- php (CLI)
- [Bun](https://bun.sh)

## Usage

This tool is designed for [air-light](https://github.com/digitoimistodude/air-light), but can be used with any WordPress theme. You just need to configure the input and output directories respectively.

By default, the tool looks for .php files in the `template-parts/blocks` directory and generates blocks to `blocks/` directory. Blocks are generated like this: `template-parts/blocks/test.php` -> `blocks/test/block.json`. You can register the block using `register_block_type( __DIR__ . "/blocks/<block name>/block.json" )` in functions.php.

Blocks are configured with a comment header (similar to themes or plugins), like this:

```php
<?php
/**
 * Title:             Test block
 * Category:          air-blocks
 * Description:       Example block
 * Icon:              star
 */

register_attribute('test', 'Test value', 'string', 'Default value');
register_attribute('show_test', 'Show test', 'boolean', false);
register_attribute('select_option', 'Select option', 'enum', 'option-2', [
  'option-1' => 'Option 1',
  'option-2' => 'Option 2',
  'option-3' => 'Option 3',
]);
?>
<section class="block block-testi">
  <h1 wp-rich="title" wp-placeholder="Rich text title placeholder"><?php echo attr('title'); ?></h1>
  <h2><?php echo attr('test'); ?></h2>

  <!-- Use wp-rich-formats to specify allowed formats, default none. -->
  <!-- Separated by a comma, no spaces. If a namespace (namespace/format) is not specified, by default using core -->
  <p wp-rich="description" wp-default="Air Blocks Buildtool rocks!" wp-rich-formats="bold,italic,code,image,text-color,link,keyboard"><?php echo attr('description'); ?></p>

  <?php if (attr('show_test')) : ?>
    <p>Test showing</p>
  <?php endif; ?>

  <!-- Use wp-allowed-blocks to specify allowed blocks, default all. -->
  <!-- Separated by a comma, no spaces. If a namespace (namespace/block) is not specified, by default using core -->
  <InnerBlocks wp-allowed-blocks="paragraph" />
</section>
```

To build the blocks, run `bun /path/to/repository build` in the theme directory.

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
