const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // Set mode explicitly
  entry: './src/main.ts', // Your entry TypeScript file
  resolve: {
    extensions: ['.ts', '.js'], // Support TypeScript and JavaScript
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Path to your source HTML file
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'assets')
    },
    port: 8080, // Specify the port
    open: true, // Automatically open the browser
  },
};
