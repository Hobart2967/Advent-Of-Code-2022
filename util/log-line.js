module.exports = {
  logLine: function() {
  console.log(
    Array
      .from(Array(50))
      .map(() => '-')
      .join(''));
  }
}