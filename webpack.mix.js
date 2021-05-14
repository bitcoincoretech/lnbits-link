const mix = require('laravel-mix')

mix
  .webpackConfig({
    node: {
      global: false,
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.runtime.js',
      },
    },
  })
  
  .copy('src/manifest.json', 'dist/')
  .copyDirectory('src/assets/img', 'dist/img')

  .copy('src/views/popup/popup.html', 'dist/views/popup/')
  .copy('src/views/popup/style.css', 'dist/views/popup/')
  .js('src/views/popup/popup.js', 'dist/views/popup/')

  .copy('src/views/options/options.html', 'dist/views/options/')
  .copy('src/views/options/style.css', 'dist/views/options/')
  .js('src/views/options/options.js', 'dist/views/options/')
  
  .vue()
