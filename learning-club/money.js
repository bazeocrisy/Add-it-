/* ───────────── MONEY: coins and amounts up to $1.00 (starts at the very basics) ─────────────
   Coin codes: p = penny, n = nickel, d = dime, q = quarter. Lowercase = heads, UPPERCASE = tails.
   Item kinds used here:
     mc   with  coins: 'qdn'  (coins shown above the question)  and/or  cc: true (choices are coin codes)
     num  (count the coins, type the total): coins: 'qdnp'; the answer is computed from the coins unless ans is given
     tray (make an amount): target (cents); optional only: 'dnp' (allowed coins), fewest: true
   Explanations for counting items are generated from the coins, so the key always matches the picture. */
'use strict';

AREAS.push({ id: 'money', name: 'Money', short: 'Money', mode: 'money', icon: 'coin', blurb: 'Know your coins, count them, and make amounts up to $1.00.' });

SKILLS.money = [
  { id: 'names', name: 'Know the coins', lesson: 'A' },
  { id: 'values', name: 'What each coin is worth', lesson: 'B' },
  { id: 'count1', name: 'Count pennies and nickels', lesson: 'C' },
  { id: 'count2', name: 'Count dimes and quarters', lesson: 'D' },
  { id: 'mix2', name: 'Count two kinds of coins', lesson: 'E' },
  { id: 'mix', name: 'Count a mixed handful', lesson: 'F' },
  { id: 'make', name: 'Make an amount', lesson: 'G' },
  { id: 'dollar', name: 'One dollar', lesson: 'H' }
];

var REAL_COINS = 'Try it with real coins: ';

LESSONS.money = [
  { id: 'A', title: 'Meet the Coins', skill: 'names', key: 'Penny, nickel, dime, quarter: look at the color, the size, and the edge.', steps: [
    { t: 'explain', title: 'Four coins', text: ['We use four coins most of the time.', 'They are the penny, the nickel, the dime, and the quarter.', 'Look at three clues: color, size, and edge.'] },
    { t: 'coins', title: 'Meet each coin', rows: [{ coins: 'pndq', labels: ['penny', 'nickel', 'dime', 'quarter'] }], text: ['The penny is copper (brown-orange). The others are silver.', 'The dime is the SMALLEST coin. The quarter is the BIGGEST.', 'Dimes and quarters have bumpy edges. Pennies and nickels have smooth edges.'] },
    { t: 'coins', title: 'Every coin has two sides', rows: [{ coins: 'pPnN', labels: ['penny front', 'penny back', 'nickel front', 'nickel back'] }, { coins: 'dDqQ', labels: ['dime front', 'dime back', 'quarter front', 'quarter back'] }], text: ['The front is called heads. It shows a person.', 'The back is called tails.', 'Both sides are the same coin with the same value.'] },
    { t: 'guided', coach: 'Look for the SMALLEST silver coin with a bumpy edge.', q: { k: 'mc', cc: true, q: 'Which coin is the dime?', c: ['n', 'd', 'p'], a: 1, h: 'Is it silver or copper? Is it small or big?', h2: 'The dime is silver and it is the smallest coin of all, even smaller than the penny.', ex: 'The dime is the small silver coin with a bumpy edge.', why: ['That is a nickel. It is bigger than a dime and has a smooth edge.', null, 'That is a penny. It is copper colored.'] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is the penny?', c: ['q', 'd', 'p'], a: 2, h: 'Which coin is a different color?', h2: 'Three coins are silver. The penny is the only copper coin.', ex: 'The penny is the copper (brown-orange) coin.', why: ['That is a quarter, the biggest silver coin.', 'That is a dime, the smallest silver coin.', null] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is the quarter?', c: ['n', 'q', 'd'], a: 1, h: 'Which silver coin is the biggest?', h2: 'Compare the sizes. The quarter is the largest coin, and it has a bumpy edge.', ex: 'The quarter is the biggest silver coin.', why: ['That is a nickel. It is a little smaller and has a smooth edge.', null, 'That is a dime, the smallest coin.'] } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'ask for a penny, a nickel, a dime, and a quarter.', 'Close your eyes and feel the edges. Which ones are bumpy?', 'Then line them up from smallest to biggest.'] }
  ] },
  { id: 'B', title: 'What Each Coin Is Worth', skill: 'values', key: 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. Size does not tell the value.', steps: [
    { t: 'explain', title: 'Coins have values', text: ['Each coin is worth some cents.', 'We write cents with this sign: ¢.'] },
    { t: 'coins', title: 'Learn the values', rows: [{ coins: 'pndq', labels: ['penny 1¢', 'nickel 5¢', 'dime 10¢', 'quarter 25¢'] }], text: ['Penny = 1¢. Nickel = 5¢. Dime = 10¢. Quarter = 25¢.'] },
    { t: 'explain', title: 'The tricky one', text: ['The dime is SMALLER than the nickel, but it is worth MORE.', 'A dime is 10¢. A nickel is only 5¢.', 'So do not use size to tell the value. Know the coin.'], box: ['nickel: bigger, smooth edge, 5¢', 'dime: smaller, bumpy edge, 10¢'] },
    { t: 'guided', coach: 'Name each coin first. Then remember its value. Do not go by size.', q: { k: 'mc', cc: true, q: 'Which coin is worth MORE?', c: ['n', 'd'], a: 1, h: 'Name the two coins first.', h2: 'One is a nickel and one is a dime. Which of those two is worth 10¢?', ex: 'The dime is worth 10¢ and the nickel is worth 5¢, so the dime is worth more, even though it is smaller.', why: ['That is the nickel. It is bigger, but it is only worth 5¢.', null] } },
    { t: 'try', q: { k: 'mc', coins: 'q', q: 'How much is this coin worth?', c: ['5¢', '10¢', '25¢', '1¢'], a: 2, h: 'Name the coin first.', h2: 'It is the biggest silver coin with a bumpy edge. What is that coin worth?', ex: 'It is a quarter. A quarter is worth 25¢.', why: ['5¢ is a nickel.', '10¢ is a dime.', null, '1¢ is a penny.'] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is worth the MOST?', c: ['d', 'q', 'n'], a: 1, h: 'Say the value of each coin.', h2: 'Dime 10¢, nickel 5¢, and one coin worth 25¢. Which is the biggest number?', ex: 'The quarter is worth 25¢, more than the dime (10¢) or the nickel (5¢).', why: ['The dime is worth 10¢.', null, 'The nickel is worth 5¢.'] } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'put a penny, nickel, dime, and quarter in a row.', 'Point to each one and say its value out loud: 1¢, 5¢, 10¢, 25¢.', 'Now mix them up and do it again.'] }
  ] },
  { id: 'C', title: 'Count Pennies and Nickels', skill: 'count1', key: 'Count pennies by 1s. Count nickels by 5s.', steps: [
    { t: 'explain', title: 'Counting coins', text: ['To find how much money there is, count the VALUE, not the number of coins.', 'Pennies are 1¢ each, so count by 1s.', 'Nickels are 5¢ each, so count by 5s.'] },
    { t: 'coins', title: 'Count the pennies', rows: [{ coins: 'pppp', labels: ['1¢', '2¢', '3¢', '4¢'] }], text: ['1, 2, 3, 4. Four pennies make 4¢.'] },
    { t: 'coins', title: 'Count the nickels', rows: [{ coins: 'nnnn', labels: ['5¢', '10¢', '15¢', '20¢'] }], text: ['5, 10, 15, 20. Four nickels make 20¢, not 4¢!'] },
    { t: 'guided', coach: 'Touch each nickel and count by 5s: 5, 10, 15...', q: { k: 'num', coins: 'nnn', h: 'These are all nickels. Count by 5s.', h2: 'Touch the first nickel and say 5. Touch the next and say 10. Keep going.' } },
    { t: 'try', q: { k: 'num', coins: 'pppppp', h: 'These are all pennies. Count by 1s.', h2: 'Touch each penny and count: 1, 2, 3...' } },
    { t: 'try', q: { k: 'num', coins: 'nnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s, one number for each nickel.' } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'grab a handful of nickels.', 'Slide them one at a time and count by 5s out loud.'] }
  ] },
  { id: 'D', title: 'Count Dimes and Quarters', skill: 'count2', key: 'Count dimes by 10s. Count quarters by 25s: 25, 50, 75, 100.', steps: [
    { t: 'explain', title: 'Bigger jumps', text: ['Dimes are 10¢ each, so count by 10s.', 'Quarters are 25¢ each, so count by 25s.', 'Learn this quarter count by heart: 25, 50, 75, 100.'] },
    { t: 'coins', title: 'Count the dimes', rows: [{ coins: 'ddd', labels: ['10¢', '20¢', '30¢'] }], text: ['10, 20, 30. Three dimes make 30¢.'] },
    { t: 'coins', title: 'Count the quarters', rows: [{ coins: 'qqqq', labels: ['25¢', '50¢', '75¢', '100¢'] }], text: ['25, 50, 75, 100. Four quarters make 100¢.'] },
    { t: 'guided', coach: 'Touch each dime and count by 10s.', q: { k: 'num', coins: 'dddd', h: 'All dimes. Count by 10s.', h2: 'Say 10 for the first dime, 20 for the next, and keep going.' } },
    { t: 'try', q: { k: 'num', coins: 'qqq', h: 'All quarters. Count by 25s.', h2: 'Use the quarter count: 25, 50, 75...' } },
    { t: 'try', q: { k: 'num', coins: 'ddddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s, one number for each dime.' } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'stack quarters and say 25, 50, 75, 100.', 'Then trade: 10 dimes make the same amount as 4 quarters.'] }
  ] },
  { id: 'E', title: 'Count Two Kinds of Coins', skill: 'mix2', key: 'Start with the coins worth the most. Then count on.', steps: [
    { t: 'explain', title: 'Two kinds together', text: ['When there are two kinds of coins, count the bigger-value coins first.', 'Then COUNT ON with the smaller coins.'], box: ['2 dimes and 3 pennies:', 'Dimes first: 10, 20.', 'Count on with pennies: 21, 22, 23. That makes 23¢.'] },
    { t: 'coins', title: 'Watch me count', rows: [{ coins: 'ddppp', labels: ['10¢', '20¢', '21¢', '22¢', '23¢'] }], text: ['10, 20, then 21, 22, 23. Total: 23¢.'] },
    { t: 'coins', title: 'A quarter and nickels', rows: [{ coins: 'qnn', labels: ['25¢', '30¢', '35¢'] }], text: ['Quarter first: 25. Then count on by 5s: 30, 35. Total: 35¢.'] },
    { t: 'guided', coach: 'Start with the quarter: 25. Then count on 10 for each dime.', q: { k: 'num', coins: 'qdd', h: 'Which coin is worth the most? Start there.', h2: 'Say 25 for the quarter. Then count on by 10s for the dimes.' } },
    { t: 'try', q: { k: 'num', coins: 'nnnpppp', h: 'Count the nickels first, then the pennies.', h2: 'Count the nickels by 5s. Then count on by 1s for each penny.' } },
    { t: 'try', q: { k: 'num', coins: 'qqn', h: 'Count the quarters first.', h2: 'Quarters: 25, 50. Then count on 5 for the nickel.' } }
  ] },
  { id: 'F', title: 'Count a Mixed Handful', skill: 'mix', key: 'Sort the coins from biggest value to smallest. Then count on.', steps: [
    { t: 'explain', title: 'A mixed-up handful', text: ['Real coins come all mixed up.', 'First, put them in order: quarters, then dimes, then nickels, then pennies.', 'Then count on, one coin at a time.'] },
    { t: 'coins', title: 'Sort first', rows: [{ coins: 'pdqn', labels: ['penny', 'dime', 'quarter', 'nickel'] }, { coins: 'qdnp', labels: ['25¢', '35¢', '40¢', '41¢'] }], text: ['Mixed up on top. Sorted below: quarter, dime, nickel, penny.', 'Count on: 25, 35, 40, 41. Total: 41¢.'] },
    { t: 'guided', coach: 'In your head, put the coins in order. Start with the quarter, then the dimes, then the nickel, then the penny.', q: { k: 'num', coins: 'dnqdpp', h: 'Find the coin worth the most and start there.', h2: 'Quarter first (25). Then count on 10 for each dime. Then 5 for the nickel. Then 1 for the penny.' } },
    { t: 'try', q: { k: 'num', coins: 'ndqpq', h: 'Sort the coins in your head: biggest value first.', h2: 'Count both quarters first: 25, 50. Then count on the dime, the nickel, and the penny.' } },
    { t: 'try', q: { k: 'num', coins: 'pdnndp', h: 'Start with the dimes.', h2: 'There is no quarter. Count the dimes first, then the nickels, then the pennies.' } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'ask a grown-up for a small handful of change.', 'Sort it into four piles, then count it, biggest coins first.', 'Have the grown-up check your total.'] }
  ] },
  { id: 'G', title: 'Make an Amount', skill: 'make', key: 'Start with the biggest coin that is not too much. Then add smaller coins.', steps: [
    { t: 'explain', title: 'Make the amount', text: ['Now YOU choose the coins.', 'Start with the biggest coin that is not more than the amount.', 'Add smaller coins until you reach it exactly.'], box: ['Make 35¢:', 'A quarter is 25¢. That is not too much. Take it.', 'Add a dime: 25 + 10 = 35¢. Stop!'] },
    { t: 'explain', title: 'How to use the tray', text: ['Tap a coin to put it in the tray.', 'Tap a coin in the tray to take it back out.', 'Press Check when you think you have it.'] },
    { t: 'guided', coach: 'Watch the running total as you add coins. Stop when it says 35¢.', q: { k: 'tray', target: 35, h: 'Start with a quarter. How much more do you need?', h2: '35 − 25 = 10. Which one coin is worth 10¢?' } },
    { t: 'try', q: { k: 'tray', target: 40, h: 'Start with the biggest coin that is not more than 40¢.', h2: 'A quarter is 25¢. Then you need 15¢ more. Which coins make 15¢?' } },
    { t: 'try', q: { k: 'tray', target: 16, h: 'Can you use a quarter? Is it too much?', h2: 'A quarter is too much. Start with a dime, then add more.' } },
    { t: 'explain', title: 'Off the screen', text: [REAL_COINS + 'have a grown-up say an amount, like 27¢.', 'Make it with real coins, then count to check.'] }
  ] },
  { id: 'H', title: 'One Dollar', skill: 'dollar', key: '100¢ = $1.00. Four quarters, ten dimes, or twenty nickels make one dollar.', steps: [
    { t: 'explain', title: 'One hundred cents', text: ['100 cents is the same as ONE DOLLAR.', 'We write one dollar like this: $1.00.'], box: ['4 quarters = 100¢ = $1.00', '10 dimes = 100¢ = $1.00', '20 nickels = 100¢ = $1.00'] },
    { t: 'coins', title: 'Four quarters make a dollar', rows: [{ coins: 'qqqq', labels: ['25¢', '50¢', '75¢', '$1.00'] }], text: ['25, 50, 75, 100. That is $1.00.'] },
    { t: 'explain', title: 'Reading dollars and cents', text: ['The number before the dot is dollars. The two numbers after the dot are cents.'], box: ['$1.25 = 1 dollar and 25 cents', '$1.05 = 1 dollar and 5 cents', '$0.75 = 75 cents (no dollars)'] },
    { t: 'guided', coach: 'Use only quarters. Count by 25s until you reach 100.', q: { k: 'tray', target: 100, only: 'q', h: 'How many quarters make 100¢?', h2: 'Count by 25s as you tap: 25, 50, 75...' } },
    { t: 'try', q: { k: 'mc', q: 'Which is the same as $1.00?', c: ['4 dimes', '4 quarters', '10 nickels'], a: 1, h: 'Count each choice. Which one makes 100¢?', h2: 'Count by 10s for dimes, by 25s for quarters, and by 5s for nickels.', ex: '4 quarters: 25, 50, 75, 100. That is $1.00.', why: ['4 dimes make 40¢.', null, '10 nickels make 50¢.'] } },
    { t: 'try', q: { k: 'mc', q: 'How do you write one dollar and thirty cents?', c: ['$130', '$1.30', '1.30¢'], a: 1, h: 'Dollars go before the dot. Cents go after it.', h2: 'Write the dollar sign, then 1, then a dot, then the cents.', ex: '$1.30 means 1 dollar and 30 cents.', why: ['$130 means one hundred thirty dollars.', null, 'When you use the dollar sign, you do not also write ¢.'] } }
  ] }
];

/* Practice bank (separate from the check bank below) */
var MONEY_BANK = [
  // names
  { id: 'mo1', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the nickel?', c: ['q', 'n', 'd'], a: 1, h: 'Silver, smooth edge, and medium size.', h2: 'Look at the edges: the nickel is the silver coin with a smooth edge.', ex: 'The nickel is silver with a smooth edge.', why: ['That is a quarter. It has a bumpy edge and is bigger.', null, 'That is a dime. It is the smallest coin.'] },
  { id: 'mo2', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the dime?', c: ['p', 'd', 'q'], a: 1, h: 'Find the smallest silver coin.', h2: 'The penny and the dime are both small. The dime is silver; the penny is copper.', ex: 'The dime is the small silver coin with a bumpy edge.', why: ['That is a penny. It is copper.', null, 'That is a quarter. It is the biggest coin.'] },
  { id: 'mo3', sk: 'names', k: 'mc', coins: 'D', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['nickel', 'dime', 'quarter'], a: 1, h: 'Look at the size and the edge.', h2: 'It is very small and silver with a bumpy edge. Read the words on it too.', ex: 'It is a dime. The words say ONE DIME, and it is small with a bumpy edge.', why: ['A nickel has a smooth edge and shows a building on the back.', null, 'A quarter is bigger and shows an eagle.'] },
  { id: 'mo4', sk: 'names', k: 'mc', coins: 'Q', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['quarter', 'nickel', 'penny'], a: 0, h: 'Is it big or small? Silver or copper?', h2: 'Big, silver, with a bumpy edge. Read the words at the bottom.', ex: 'It is a quarter. The words say QUARTER DOLLAR.', why: [null, 'A nickel shows a building and has a smooth edge.', 'A penny is copper.'] },
  { id: 'mo5', sk: 'names', k: 'mc', q: 'Which coin is copper colored?', c: ['dime', 'penny', 'nickel'], a: 1, h: 'Only one coin is not silver.', h2: 'Think about the brown-orange coin from the lesson.', ex: 'The penny is the only copper coin.', why: ['A dime is silver.', null, 'A nickel is silver.'] },
  { id: 'mo6', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the quarter?', c: ['d', 'n', 'q'], a: 2, h: 'Find the biggest coin.', h2: 'The quarter is the biggest silver coin and has a bumpy edge.', ex: 'The quarter is the biggest silver coin.', why: ['That is a dime, the smallest coin.', 'That is a nickel. Its edge is smooth.', null] },
  // values
  { id: 'mo7', sk: 'values', k: 'mc', coins: 'n', q: 'How much is this coin worth?', c: ['10¢', '5¢', '1¢', '25¢'], a: 1, h: 'Name the coin first.', h2: 'It is silver with a smooth edge. That coin is worth 5 pennies.', ex: 'It is a nickel. A nickel is worth 5¢.', why: ['10¢ is a dime.', null, '1¢ is a penny.', '25¢ is a quarter.'] },
  { id: 'mo8', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 10¢?', c: ['n', 'd', 'q'], a: 1, h: 'Which coin is small but worth more than a nickel?', h2: 'The 10¢ coin is the smallest coin of all.', ex: 'The dime is worth 10¢.', why: ['The nickel is worth 5¢.', null, 'The quarter is worth 25¢.'] },
  { id: 'mo9', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth LESS?', c: ['d', 'n'], a: 1, h: 'Name both coins and say their values.', h2: 'Do not go by size. Say the value of the dime, then the value of the nickel.', ex: 'The nickel (5¢) is worth less than the dime (10¢), even though the nickel is bigger.', why: ['That is the dime. It is small but worth 10¢.', null] },
  { id: 'mo10', sk: 'values', k: 'mc', q: 'A penny is worth ___.', c: ['1¢', '5¢', '10¢'], a: 0, h: 'The penny is worth the least of all the coins.', h2: 'The penny is the 1-cent coin.', ex: 'A penny is worth 1¢.', why: [null, '5¢ is a nickel.', '10¢ is a dime.'] },
  { id: 'mo11', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 25¢?', c: ['q', 'n', 'p'], a: 0, h: 'The 25¢ coin is the biggest.', h2: 'Look for the biggest silver coin with a bumpy edge.', ex: 'The quarter is worth 25¢.', why: [null, 'The nickel is worth 5¢.', 'The penny is worth 1¢.'] },
  { id: 'mo12', sk: 'values', k: 'mc', coins: 'P', q: 'This is the back of a coin. How much is it worth?', c: ['1¢', '10¢', '5¢'], a: 0, h: 'What color is it?', h2: 'A copper coin is a penny, no matter which side you see.', ex: 'It is a penny (the words say ONE CENT). A penny is worth 1¢.', why: [null, 'A dime is silver.', 'A nickel is silver.'] },
  // count1
  { id: 'mo13', sk: 'count1', k: 'num', coins: 'ppppp', h: 'All pennies. Count by 1s.', h2: 'Touch each penny and count: 1, 2, 3...' },
  { id: 'mo14', sk: 'count1', k: 'num', coins: 'pppppppp', h: 'All pennies. Count by 1s.', h2: 'Count carefully, one number for each penny.' },
  { id: 'mo15', sk: 'count1', k: 'num', coins: 'nnnn', h: 'All nickels. Count by 5s.', h2: 'Say 5 for the first nickel, 10 for the next...' },
  { id: 'mo16', sk: 'count1', k: 'num', coins: 'nnnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s, one number for each nickel.' },
  { id: 'mo17', sk: 'count1', k: 'num', coins: 'nn', h: 'All nickels. Count by 5s.', h2: 'Two nickels: say 5, then 10.' },
  { id: 'mo18', sk: 'count1', k: 'num', coins: 'nnnnnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s. Touch each nickel as you count.' },
  // count2
  { id: 'mo19', sk: 'count2', k: 'num', coins: 'dd', h: 'All dimes. Count by 10s.', h2: 'Say 10, then 20.' },
  { id: 'mo20', sk: 'count2', k: 'num', coins: 'ddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s, one number for each dime.' },
  { id: 'mo21', sk: 'count2', k: 'num', coins: 'dddddd', h: 'All dimes. Count by 10s.', h2: 'Touch each dime: 10, 20, 30...' },
  { id: 'mo22', sk: 'count2', k: 'num', coins: 'qq', h: 'All quarters. Count by 25s.', h2: 'Use the quarter count: 25, 50, 75, 100.' },
  { id: 'mo23', sk: 'count2', k: 'num', coins: 'qQq', h: 'All quarters. Count by 25s.', h2: 'Quarter count: 25, 50, 75...' },
  { id: 'mo24', sk: 'count2', k: 'num', coins: 'ddddddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s. Touch each dime as you count.' },
  // mix2
  { id: 'mo25', sk: 'mix2', k: 'num', coins: 'dppp', h: 'Count the dime first, then the pennies.', h2: 'Start at 10. Then count on 1 for each penny.' },
  { id: 'mo26', sk: 'mix2', k: 'num', coins: 'nnpp', h: 'Nickels first, then pennies.', h2: 'Count the nickels by 5s. Then count on by 1s.' },
  { id: 'mo27', sk: 'mix2', k: 'num', coins: 'qnn', h: 'Quarter first.', h2: 'Start at 25. Then count on 5 for each nickel.' },
  { id: 'mo28', sk: 'mix2', k: 'num', coins: 'dddnn', h: 'Dimes first, then nickels.', h2: 'Count the dimes by 10s. Then count on by 5s.' },
  { id: 'mo29', sk: 'mix2', k: 'num', coins: 'qppp', h: 'Quarter first, then pennies.', h2: 'Start at 25. Then count on 1 for each penny.' },
  { id: 'mo30', sk: 'mix2', k: 'num', coins: 'qqddd', h: 'Quarters first, then dimes.', h2: 'Quarters: 25, 50. Then count on 10 for each dime.' },
  // mix
  { id: 'mo31', sk: 'mix', k: 'num', coins: 'nqpd', h: 'Sort in your head: quarter, dime, nickel, penny.', h2: 'Start at 25 for the quarter, then count on the dime, the nickel, and the penny.' },
  { id: 'mo32', sk: 'mix', k: 'num', coins: 'dpqdn', h: 'Find the coin worth the most and start there.', h2: 'Quarter first. Then the two dimes, the nickel, and the penny.' },
  { id: 'mo33', sk: 'mix', k: 'num', coins: 'pqdqnp', h: 'Count the quarters first.', h2: 'Two quarters: 25, 50. Then count on the dime, the nickel, and the pennies.' },
  { id: 'mo34', sk: 'mix', k: 'num', coins: 'dndnp', h: 'No quarters here. Start with the dimes.', h2: 'Dimes first: 10, 20. Then the nickels by 5s. Then the penny.' },
  { id: 'mo35', sk: 'mix', k: 'num', coins: 'ndppqn', h: 'Sort: quarter, dime, nickels, pennies.', h2: 'Start at 25, add the dime, then count on the nickels and pennies.' },
  { id: 'mo36', sk: 'mix', k: 'num', coins: 'pnndp', h: 'Start with the dime.', h2: 'Dime first: 10. Then count on 5 for each nickel and 1 for each penny.' },
  // make
  { id: 'mo37', sk: 'make', k: 'tray', target: 30, h: 'Start with the biggest coin that is not more than 30¢.', h2: 'A quarter is 25¢. How much more do you need to reach 30¢?' },
  { id: 'mo38', sk: 'make', k: 'tray', target: 45, h: 'Start with a quarter.', h2: 'After a quarter you need 20¢ more. Which coins make 20¢?' },
  { id: 'mo39', sk: 'make', k: 'tray', target: 12, h: 'Is a quarter too much? What about a dime?', h2: 'Start with a dime. Then you need 2¢ more.' },
  { id: 'mo40', sk: 'make', k: 'tray', target: 60, h: 'Start with quarters. How many fit?', h2: 'Two quarters make 50¢. Then you need 10¢ more.' },
  { id: 'mo41', sk: 'make', k: 'tray', target: 50, only: 'dn', h: 'You can use only dimes and nickels here.', h2: 'Count by 10s with dimes. Use a nickel if you need 5 more.' },
  { id: 'mo42', sk: 'make', k: 'tray', target: 30, fewest: true, h: 'Use the FEWEST coins you can. Start with the biggest coin that fits.', h2: 'A quarter fits in 30¢. Then one more coin makes 5¢.' },
  // dollar
  { id: 'mo43', sk: 'dollar', k: 'tray', target: 100, only: 'd', h: 'How many dimes make 100¢?', h2: 'Count by 10s as you tap: 10, 20, 30...' },
  { id: 'mo44', sk: 'dollar', k: 'mc', q: 'How do you write one dollar and twenty-five cents?', c: ['$125', '1.25¢', '$1.25'], a: 2, h: 'Dollars go before the dot. Cents go after it.', h2: 'Start with the dollar sign. Write the dollars, a dot, then two digits for cents.', ex: '$1.25 means 1 dollar and 25 cents.', why: ['$125 means one hundred twenty-five dollars.', 'With a dollar amount, use the $ sign, not ¢.', null] },
  { id: 'mo45', sk: 'dollar', k: 'num', q: 'How many cents are in one dollar?', ans: 100, h: 'Think: how many pennies make a dollar?', h2: 'Four quarters: 25, 50, 75, ... What comes next?', ex: 'There are 100 cents in one dollar.' },
  { id: 'mo46', sk: 'dollar', k: 'mc', q: 'Which coins make exactly $1.00?', c: ['3 quarters and 2 dimes', '3 quarters, 2 dimes, and 1 nickel', '2 quarters and 3 dimes'], a: 1, h: 'Count each choice, quarters first.', h2: 'Count each one: 3 quarters is 75¢. Then add the other coins and see which reaches 100¢.', ex: '25, 50, 75, then 85, 95, then 100. That is $1.00.', why: ['That makes 95¢.', null, 'That makes 80¢.'] },
  { id: 'mo47', sk: 'dollar', k: 'mc', q: 'What does $0.60 mean?', c: ['60 dollars', '60 cents', '6 cents'], a: 1, h: 'Look at the number before the dot.', h2: 'A 0 before the dot means no dollars. The two digits after the dot are the cents.', ex: '$0.60 means 60 cents.', why: ['60 dollars would be written $60.00.', null, '6 cents would be written $0.06.'] },
  { id: 'mo48', sk: 'dollar', k: 'tray', target: 100, only: 'q', h: 'How many quarters make a dollar?', h2: 'Count by 25s as you tap.' }
];

/* Check My Skills bank: different coin sets and amounts from practice and lessons */
var MONEY_CHECK = [
  { id: 'mc1', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the dime?', c: ['q', 'n', 'd'], a: 2, h: 'Smallest silver coin.', h2: 'Look at size and edge.', ex: 'The dime is the small silver coin with a bumpy edge.' },
  { id: 'mc2', sk: 'names', k: 'mc', coins: 'N', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['dime', 'quarter', 'nickel'], a: 2, h: 'Smooth edge or bumpy edge?', h2: 'Read the words and look at the edge.', ex: 'It is a nickel. It shows a building and says FIVE CENTS.' },
  { id: 'mc3', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the penny?', c: ['n', 'p', 'd'], a: 1, h: 'Which coin is a different color?', h2: 'Look for copper.', ex: 'The penny is the copper coin.' },
  { id: 'mc4', sk: 'names', k: 'mc', coins: 'q', q: 'Which coin is this?', c: ['nickel', 'quarter', 'dime'], a: 1, h: 'How big is it? What kind of edge?', h2: 'Look at the size and the edge.', ex: 'It is a quarter: the biggest silver coin, with a bumpy edge.' },
  { id: 'mc5', sk: 'values', k: 'mc', coins: 'd', q: 'How much is this coin worth?', c: ['5¢', '1¢', '10¢', '25¢'], a: 2, h: 'Name the coin first.', h2: 'Small, silver, bumpy edge.', ex: 'It is a dime. A dime is worth 10¢.' },
  { id: 'mc6', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 5¢?', c: ['d', 'p', 'n'], a: 2, h: 'Say each coin’s value.', h2: 'Do not go by size.', ex: 'The nickel is worth 5¢.' },
  { id: 'mc7', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth MORE?', c: ['q', 'd'], a: 0, h: 'Name the coins, then compare values.', h2: '25¢ or 10¢?', ex: 'The quarter (25¢) is worth more than the dime (10¢).' },
  { id: 'mc8', sk: 'values', k: 'mc', coins: 'Q', q: 'This is the back of a coin. How much is it worth?', c: ['10¢', '25¢', '5¢'], a: 1, h: 'Which coin is it?', h2: 'Big, silver, eagle on the back.', ex: 'It is a quarter, worth 25¢.' },
  { id: 'mc9', sk: 'count1', k: 'num', coins: 'ppppppp', h: 'Count by 1s.', h2: 'One number for each penny.' },
  { id: 'mc10', sk: 'count1', k: 'num', coins: 'nnnnnnnnn', h: 'Count by 5s.', h2: 'Say 5, 10...' },
  { id: 'mc11', sk: 'count1', k: 'num', coins: 'nnnnnnn', h: 'Count by 5s.', h2: 'One number for each nickel.' },
  { id: 'mc12', sk: 'count1', k: 'num', coins: 'pppppppppp', h: 'Count by 1s.', h2: 'Count carefully.' },
  { id: 'mc13', sk: 'count2', k: 'num', coins: 'dddddddddd', h: 'Count by 10s.', h2: 'Say 10, 20...' },
  { id: 'mc14', sk: 'count2', k: 'num', coins: 'dddddddd', h: 'Count by 10s.', h2: 'One number for each dime.' },
  { id: 'mc15', sk: 'count2', k: 'num', coins: 'QqQq', h: 'Count by 25s.', h2: 'Quarter count: 25, 50...' },
  { id: 'mc17', sk: 'mix2', k: 'num', coins: 'ddpp', h: 'Dimes first.', h2: 'Then count on the pennies.' },
  { id: 'mc18', sk: 'mix2', k: 'num', coins: 'qqd', h: 'Quarters first.', h2: 'Then count on the dime.' },
  { id: 'mc19', sk: 'mix2', k: 'num', coins: 'nnnp', h: 'Nickels first.', h2: 'Then count on the penny.' },
  { id: 'mc20', sk: 'mix2', k: 'num', coins: 'qdddd', h: 'Quarter first.', h2: 'Then count on the dimes.' },
  { id: 'mc21', sk: 'mix', k: 'num', coins: 'pdqdd', h: 'Sort first.', h2: 'Biggest value first, then count on.' },
  { id: 'mc22', sk: 'mix', k: 'num', coins: 'nqnpd', h: 'Sort first.', h2: 'Biggest value first, then count on.' },
  { id: 'mc23', sk: 'mix', k: 'num', coins: 'dqpqq', h: 'Sort first.', h2: 'Biggest value first, then count on.' },
  { id: 'mc24', sk: 'mix', k: 'num', coins: 'ppndpp', h: 'Sort first.', h2: 'Biggest value first, then count on.' },
  { id: 'mc25', sk: 'make', k: 'tray', target: 55, h: 'Biggest coin that fits first.', h2: 'Then add smaller coins.' },
  { id: 'mc26', sk: 'make', k: 'tray', target: 22, h: 'Biggest coin that fits first.', h2: 'Then add smaller coins.' },
  { id: 'mc27', sk: 'make', k: 'tray', target: 70, h: 'Biggest coin that fits first.', h2: 'Then add smaller coins.' },
  { id: 'mc28', sk: 'make', k: 'tray', target: 65, fewest: true, h: 'Use the fewest coins.', h2: 'Biggest coin that fits first.' },
  { id: 'mc29', sk: 'dollar', k: 'num', q: 'How many quarters make one dollar?', ans: 4, unit: '', h: 'Count by 25s.', h2: '25, 50, 75...', ex: 'Four quarters make one dollar: 25, 50, 75, 100.' },
  { id: 'mc30', sk: 'dollar', k: 'mc', q: 'How do you write one dollar and forty cents?', c: ['$1.40', '$140', '1.40¢'], a: 0, h: 'Dollars before the dot, cents after.', h2: 'Use the $ sign and a dot.', ex: '$1.40 means 1 dollar and 40 cents.' },
  { id: 'mc31', sk: 'dollar', k: 'mc', q: 'How many dimes make one dollar?', c: ['4', '10', '100'], a: 1, h: 'Count by 10s to 100.', h2: '10, 20, 30... How many 10s?', ex: 'Ten dimes make one dollar: 10, 20, ... 100.' },
  { id: 'mc32', sk: 'dollar', k: 'tray', target: 100, only: 'n', h: 'Count by 5s to 100.', h2: 'Tap nickels and count by 5s.' }
];
