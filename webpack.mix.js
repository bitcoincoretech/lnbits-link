const mix = require('laravel-mix')

mix
  .webpackConfig({
    node: {
      global: true,
    },
    devtool: 'source-map',
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.runtime.js',
        vuerouter$: 'vue-router/dist/vue-router.esm.js',
        quasar$: 'quasar/dist/quasar.esm.js',
        axios$: 'axios/index.js',
        jquery$: 'jquery/dist/jquery.js',
        lodash$: 'lodash/index.js',
        bolt11$: '@ln-zap/bolt11/payreq.js',
        stream$: 'readable-stream/readable.js',
        vueQrcode$: 'vue-qrcode/lib/esm.js'
      },
    },
  })
  .sourceMaps(true, 'source-map')
  .copy('src/manifest.json', 'dist/')
  .copyDirectory('src/assets/img', 'dist/img')
  .copyDirectory('src/assets/fonts', 'dist/fonts')
  .copyDirectory('src/assets/css', 'dist/css')
  .sass('src/assets/scss/base.scss', 'dist/css/base.css') // TODO: move all in assets folder
  .copy('node_modules/quasar/dist/quasar.css', 'dist/css/quasar.css')

  .copy('src/views/popup/popup.html', 'dist/views/popup/')
  .copy('src/views/popup/style.css', 'dist/views/popup/')
  .js('src/views/popup/popup.js', 'dist/views/popup/')

  .copy('src/views/options/options.html', 'dist/views/options/')
  .copy('src/views/options/style.css', 'dist/views/options/')
  .js('src/views/options/options.js', 'dist/views/options/')

  .copy('src/views/content-inject/content.html', 'dist/views/content-inject/')
  .copy('src/views/content-inject/inject.css', 'dist/views/content-inject/')
  .js('src/views/content-inject/content.js', 'dist/views/content-inject/')
  .js('src/views/content-inject/inject.js', 'dist/views/content-inject/')

  .js('src/content_script/index.js', 'dist/content_script/index.js')
  .js('src/background_script/index.js', 'dist/background_script/index.js')

  .vue()