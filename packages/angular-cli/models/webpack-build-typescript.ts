import * as path from 'path';
import * as webpack from 'webpack';
import {findLazyModules} from './find-lazy-modules';
import {NgcWebpackPlugin} from '@ngtools/webpack';

const atl = require('awesome-typescript-loader');

const g: any = global;
const webpackLoader: string = g['angularCliIsLocal']
  ? g.angularCliPackages['@ngtools/webpack'].main
  : '@ngtools/webpack';


export const getWebpackNonAotConfigPartial = function(projectRoot: string, appConfig: any) {
  const appRoot = path.resolve(projectRoot, appConfig.root);
  const lazyModules = findLazyModules(appRoot);

  return {
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loaders: [{
            loader: 'awesome-typescript-loader',
            query: {
              useForkChecker: true,
              tsconfig: path.resolve(appRoot, appConfig.tsconfig)
            }
          }, {
            loader: 'angular2-template-loader'
          }],
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(/.*/, appRoot, lazyModules),
      new atl.ForkCheckerPlugin(),
    ]
  };
};

export const getWebpackAotConfigPartial = function(projectRoot: string, appConfig: any) {
  return {
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loader: webpackLoader,
          exclude: [/\.(spec|e2e)\.ts$/]
        }
      ]
    },
    plugins: [
      new NgcWebpackPlugin({
        project: path.resolve(projectRoot, appConfig.root, appConfig.tsconfig),
        baseDir: path.resolve(projectRoot, ''),
        entryModule: path.join(projectRoot, appConfig.root, 'app/app.module#AppModule'),
        genDir: path.join(projectRoot, appConfig.outDir, 'ngfactory')
      }),
    ]
  };
};
