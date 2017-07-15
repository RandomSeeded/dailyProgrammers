'use strict';

// PROBLEM LINK: https://www.reddit.com/r/dailyprogrammer/comments/6l3hd8/20170703_challenge_322_easy_all_pairs_test/
// OK LET'S MAKE THIS SIMPLER
// If we were iterating over only two arrays this is easy mode
// What makes it harder about three?
// Given that we have nested loops over the first two, when we are DONE iterating over first two, how many of the pairs against the third array have we done?
//
// [1,2], [A, B], [x, y]
//
// 1Ax
// 1By
// 2Ax
// 2By
//
// What's left? 
// x: has hit 1,A,2 (not B)
// y: has hit 1,B,2 (not A)
//
// 0 A G
// 0 B G
// 0 C D
// 0 C E
// 0 C F
// 1 A D
// 1 A E
// 1 A F
// 1 B D
// 1 B E
// 1 B F
// 1 C G
//
// Why is problem iterating in this fashion? What's pattern there, if any?
// Why isn't it
// 0 A D
// 0 A E
// 0 A F
// 0 A G
//
// What if we just combinatorial and then filter? Seems easier if nothing else

const _ = require('lodash');

function genAllCombinations(inputSets) {
  // strategy here: combine base set with all remaining sets, where remaining sets is gen'd recursively
  // TIL apparently this isn't undefined
  const [baseSet, ...remainingSets] = inputSets;
  if (_.isEmpty(remainingSets)) {
    return baseSet;
  }

  const combodRemainingSets = _.flatten(genAllCombinations(remainingSets));
  const allCombinations = _.map(baseSet, baseElement => {
    return _.map(combodRemainingSets, remainingSetElem => {
      return _.concat(baseElement, remainingSetElem);
    });
  });
  return allCombinations;
}

function solve(inputSets) {
  // TODO (nw): this flatten logic may fail above 3 input arrays
  const allCombinations = _.flatten(genAllCombinations(inputSets));
  const seenPairings = {};
  // Now have full combinatorial explosion, filter to just those which meet our criteria
  const allPairSets = _.filter(allCombinations, combination => {
    // TODO (nw): improve
    let containsNewPair = false;
    _.each(combination, baseElem => {
      _.each(combination, otherElem => {
        if (baseElem === otherElem) return;

        if (!seenPairings[stringify(baseElem, otherElem)]) {
          containsNewPair = true;
        }
        seenPairings[stringify(baseElem, otherElem)] = true;
        seenPairings[stringify(otherElem, baseElem)] = true;
      });
    });
    return containsNewPair;
  });
  return allPairSets;
}

function stringify(A, B) {
  return `${A} ${B}`;
}

function test() {
  const problemSets = [
    [['0', '1'], ['A', 'B', 'C'], ['D', 'E', 'F', 'G']],
    [['0', '1', '2', '3'], ['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H', 'I']] // 44, could be as good as 34 :(
  ]
  _.each(problemSets, problemSet => {
    const soln = solve(problemSet);
    console.log('problem set:',problemSet, 'solution',soln);
    console.log('size', _.size(soln));
  });
}

test();

