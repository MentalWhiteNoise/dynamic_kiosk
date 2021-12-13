
function isNullOrWhiteSpace(text) {
    if (typeof text === 'undefined' || text == null) return true;
    return text.replace(/\s/g, '').length < 1;
}
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function sum(items, prop){
  return items.reduce( function(a, b){
      return a + b[prop];
  }, 0);
};

function maxDate(items, prop){
  const rtrn = items.reduce( function(a, b){
      return a == null ? b[prop] == null ? null : new Date(b[prop]) : a > new Date(b[prop]) ? a : new Date(b[prop]);
  }, null);
  return rtrn ? rtrn.toISOString() : null
};
module.exports = { isNullOrWhiteSpace, replaceAll, sleep, sum, maxDate};
