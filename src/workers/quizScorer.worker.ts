/**
 * @module workers.quizScorer
 * @description Web worker for scoring quiz logic using Comlink.
 */

import * as Comlink from 'comlink';

const quizScorer = {
  calculateScore(answers: number[], correctIndices: number[]): number {
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === correctIndices[i]) {
        score++;
      }
    }
    return score;
  }
};

Comlink.expose(quizScorer);
