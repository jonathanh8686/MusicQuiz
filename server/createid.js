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
    randCons= function () {
      consonants = "BCDFGHJKLMNPQRSTVWXYZ";
      return consonants.charAt(Math.floor(Math.random() * consonants.length));
    }
    randVowel= function () {
      vowels = "AEIOU";
      return vowels.charAt(Math.floor(Math.random() * vowels.length));
    }

    return randCons() + randVowel() + randCons() + randVowel() + randCons();
  },

};
