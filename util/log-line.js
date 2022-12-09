module.exports = {
  logLine: function(title = '') {
    console.log(
      Array
        .from(Array(50))
        .map(() => '-')
        .join('') + ' ' + title);
  }
}