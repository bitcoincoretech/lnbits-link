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
  
  .copy('src/app.html', 'dist/')
  .copy('src/assets/css/app.css', 'dist/')
  .js('src/assets/js/app.js', 'dist/')

  .copy('src/views/options/options.html', 'dist/views/options/')
  .copy('src/views/options/style.css', 'dist/views/options/')
  .js('src/views/options/options.js', 'dist/views/options/')
  
  .vue()
