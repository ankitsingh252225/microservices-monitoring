// cpuTasks.js
import bcrypt from "bcrypt";

function calculatePrimes(limit = 100000) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}

async function bcryptHash() {
  return await bcrypt.hash("some-data", 10);
}

function generateAndSortArray(size = 100000) {
  const arr = Array.from({ length: size }, () =>
    Math.floor(Math.random() * size)
  );
  return arr.sort((a, b) => a - b);
}

export { calculatePrimes, bcryptHash, generateAndSortArray };
