module.exports = {
  createID: function () {
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
    let rtn = "";
    let LENGTH = 5;
    let alphabet = "ABCEDFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < LENGTH; i++) {
      rtn += alphabet[getRandomInt(26)];
    }

    return rtn;
  },

  getRandID: function () {
    return randCons() + randVowel() + randCons() + randVowel() + randCons();
  },
  randCons: function () {
    consonants = "bcdfghjklmnpqrstvwxyz";
    return consonants.charAt(Math.random() % consonants.length);
  },
  randVowel: function () {
    vowels = "aeiou";
    return vowels.charAt(Math.random() % vowels.length);
  },
};
