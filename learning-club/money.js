/* ───────────── MONEY: coins and amounts up to $1.00 (starts at the very basics) ─────────────
   Coin codes: p = penny, n = nickel, d = dime, q = quarter. Lowercase = heads, UPPERCASE = tails.
   Item kinds used here (every key is COMPUTED from the item's own data, never typed in by hand):
     mc    coins: 'qdn' shows coins above the question; cc: true makes the choices coin pictures
           groups + cmp: 'more' | 'less'  → the right choice is the group worth more/less
           opts: ['qqd', ...] + want (or prices + paid) → choices are coin sets; the right one is worth exactly that
     num   coins only → count the coins
           coins + price → how much more is needed;  prices → total cost;  prices + paid → change;  groups + diff → difference
           ans → a fact with no coins (e.g. cents in a dollar)
     tray  target (cents); optional only: 'dn' (allowed coins, stated in the question), fewest: true (stated in the question)
   Lessons A–H (part 'basic') are the foundation. Lessons I–J (part 'apply') use those skills. */
'use strict';

AREAS.push({ id: 'money', name: 'Money', short: 'Money', mode: 'money', icon: 'coin', blurb: 'Know your coins, count them, make amounts up to $1.00, and find change.',
  sections: [
    { part: 'basic', title: 'Money Basics', tag: 'foundation', note: 'Lessons A to H: know the coins, count them, and make amounts up to $1.00.' },
    { part: 'apply', title: 'Use Your Money Skills', tag: 'application', note: 'Lessons I and J: compare amounts, solve store problems, and find change. Do these after the basics.' }
  ] });

SKILLS.money = [
  { id: 'names', name: 'Know the coins', lesson: 'A', strand: 'recognition' },
  { id: 'values', name: 'What each coin is worth', lesson: 'B', strand: 'recognition' },
  { id: 'count1', name: 'Count pennies and nickels', lesson: 'C', strand: 'counting' },
  { id: 'count2', name: 'Count dimes and quarters', lesson: 'D', strand: 'counting' },
  { id: 'mix2', name: 'Count two kinds of coins', lesson: 'E', strand: 'counting' },
  { id: 'mix', name: 'Count a mixed handful', lesson: 'F', strand: 'counting' },
  { id: 'make', name: 'Make an amount', lesson: 'G', strand: 'making amounts' },
  { id: 'dollar', name: 'One dollar', lesson: 'H', strand: 'counting' },
  { id: 'compare', name: 'Compare and solve', lesson: 'I', strand: 'comparison' },
  { id: 'change', name: 'Find the change', lesson: 'J', strand: 'change' }
];

var REAL_COINS = 'Try it with real coins: ';

LESSONS.money = [
  { id: 'A', part: 'basic', mins: 7, title: 'Meet the Coins', skill: 'names', goal: 'Name the penny, the nickel, the dime, and the quarter.', key: 'Penny, nickel, dime, quarter. Look at the color, the size, the picture, and the words.', steps: [
    { t: 'explain', title: 'Four coins', text: ['We use four coins most of the time: the penny, the nickel, the dime, and the quarter.', 'To tell them apart, look at four clues: the color, the size, the picture, and the words.'] },
    { t: 'coins', worked: true, title: 'Meet each coin', rows: [{ coins: 'pndq', labels: ['penny', 'nickel', 'dime', 'quarter'] }], text: ['The penny is copper colored (brown-orange). The other three are silver colored.', 'The dime is the smallest coin. The quarter is the largest.', 'These pictures are shown to scale, so the sizes compare the same way real coins do.'] },
    { t: 'coins', title: 'Every coin has two sides', rows: [{ coins: 'pPnN', labels: ['penny heads', 'penny tails', 'nickel heads', 'nickel tails'] }, { coins: 'dDqQ', labels: ['dime heads', 'dime tails', 'quarter heads', 'quarter tails'] }], text: ['The front is called heads. It shows a person.', 'The back is called tails. The words on the back name the coin: ONE CENT, FIVE CENTS, ONE DIME, QUARTER DOLLAR.', 'Both sides belong to the same coin, with the same value.'] },
    { t: 'explain', title: 'Coins can look different', text: ['Real coins can have other designs. Many quarters show a state, a national park, or a famous American woman on the back. Some nickels show a different picture of Thomas Jefferson.', 'A new design does not change the coin. A quarter is still a quarter.', 'Use the clues that stay the same: the color, the size, and the words.'] },
    { t: 'explain', title: 'Feel the edge', text: ['On a real coin, you can feel the edge. Dimes and quarters have tiny ridges around the edge. This is called a reeded edge.', 'Pennies and nickels have smooth edges.', 'Pictures cannot really show the edge, so this clue is for real coins in your hand.'] },
    { t: 'guided', coach: 'Find the silver coins first. Then compare their sizes.', q: { k: 'mc', cc: true, q: 'Which coin is the dime?', c: ['n', 'd', 'p'], a: 1, h: 'Is the dime silver or copper? Is it large or small?', h2: 'Look only at the silver coins. Which silver coin is smaller?', ex: 'The dime is the smallest silver coin.', why: ['That is a nickel. It is silver too, but it is larger than a dime.', null, 'That is a penny. It is copper colored, not silver.'] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is the penny?', c: ['q', 'd', 'p'], a: 2, h: 'Which coin is a different color?', h2: 'Look at the colors. How many are silver? How many are copper?', ex: 'The penny is the only copper-colored coin.', why: ['That is a quarter, the largest silver coin.', 'That is a dime, the smallest silver coin.', null] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is the quarter?', c: ['n', 'q', 'd'], a: 1, h: 'The quarter is silver. Is it large or small?', h2: 'Compare the sizes of the three silver coins.', ex: 'The quarter is the largest silver coin.', why: ['That is a nickel. It is smaller than a quarter.', null, 'That is a dime, the smallest coin.'] } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'ask for a penny, a nickel, a dime, and a quarter.', 'Close your eyes and feel the edges. Which two have ridges?', 'Open your eyes and name each coin out loud.'] }
  ] },
  { id: 'B', part: 'basic', mins: 6, title: 'What Each Coin Is Worth', skill: 'values', goal: 'Say what each coin is worth.', key: 'Penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. Size does not tell the value.', steps: [
    { t: 'explain', title: 'Coins have values', text: ['Each coin is worth some cents.', 'We write cents with this sign: ¢. So 5 cents is written 5¢.'] },
    { t: 'coins', worked: true, title: 'Learn the values', rows: [{ coins: 'pndq', labels: ['penny 1¢', 'nickel 5¢', 'dime 10¢', 'quarter 25¢'] }], text: ['Penny = 1¢. Nickel = 5¢. Dime = 10¢. Quarter = 25¢.'] },
    { t: 'explain', title: 'The tricky one', text: ['The dime is SMALLER than the nickel, but the dime is worth MORE.', 'A dime is worth 10¢. A nickel is worth only 5¢.', 'So size does not tell you the value. Name the coin, then say its value.'], box: ['nickel: larger, worth 5¢', 'dime: smaller, worth 10¢'] },
    { t: 'guided', coach: 'Name each coin first. Then say its value. Do not go by size.', q: { k: 'mc', cc: true, q: 'Which coin is worth MORE?', c: ['n', 'd'], a: 1, h: 'Name the two coins first.', h2: 'Say the value of each coin out loud. Which number is greater?', ex: 'The dime is worth 10¢ and the nickel is worth 5¢. The dime is worth more, even though it is smaller.', why: ['That is the nickel. It is larger, but it is worth only 5¢.', null] } },
    { t: 'try', q: { k: 'mc', coins: 'q', q: 'How much is this coin worth?', c: ['5¢', '10¢', '25¢', '1¢'], a: 2, h: 'Name the coin first.', h2: 'Look at the size and the color. Which coin is the largest silver coin? Then say its value.', ex: 'It is a quarter. A quarter is worth 25¢.', why: ['5¢ is a nickel.', '10¢ is a dime.', null, '1¢ is a penny.'] } },
    { t: 'try', q: { k: 'mc', cc: true, q: 'Which coin is worth the MOST?', c: ['d', 'q', 'n'], a: 1, h: 'Say the value of each coin.', h2: 'Name each coin, then say its value: 10¢, 25¢, or 5¢? Which number is greatest?', ex: 'The quarter is worth 25¢. That is more than a dime (10¢) or a nickel (5¢).', why: ['The dime is worth 10¢.', null, 'The nickel is worth 5¢.'] } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'put a penny, a nickel, a dime, and a quarter in a row.', 'Point to each one and say its value out loud: 1¢, 5¢, 10¢, 25¢.', 'Mix them up and do it again.'] }
  ] },
  { id: 'C', part: 'basic', mins: 6, title: 'Count Pennies and Nickels', skill: 'count1', goal: 'Count pennies by 1s and nickels by 5s.', key: 'Count pennies by 1s. Count nickels by 5s.', steps: [
    { t: 'explain', title: 'Counting coins', text: ['To find how much money there is, count what the coins are WORTH, not how many coins there are.', 'Pennies are 1¢ each, so count by 1s.', 'Nickels are 5¢ each, so count by 5s.'] },
    { t: 'coins', worked: true, title: 'Count the pennies', rows: [{ coins: 'pppp', labels: ['1¢', '2¢', '3¢', '4¢'] }], text: ['1, 2, 3, 4. Four pennies make 4¢.'] },
    { t: 'coins', worked: true, title: 'Count the nickels', rows: [{ coins: 'nnnn', labels: ['5¢', '10¢', '15¢', '20¢'] }], text: ['5, 10, 15, 20. Four nickels make 20¢, not 4¢!'] },
    { t: 'guided', coach: 'Touch each nickel and count by 5s: 5, 10, 15...', q: { k: 'num', coins: 'nnn', h: 'These are all nickels. Count by 5s.', h2: 'Touch the first nickel and say 5. Touch the next one and say 10. Keep going.' } },
    { t: 'try', q: { k: 'num', coins: 'pppppp', h: 'These are all pennies. Count by 1s.', h2: 'Touch each penny and count: 1, 2, 3...' } },
    { t: 'try', q: { k: 'num', coins: 'nnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s, one number for each nickel.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'grab a handful of nickels.', 'Slide them one at a time and count by 5s out loud.'] }
  ] },
  { id: 'D', part: 'basic', mins: 6, title: 'Count Dimes and Quarters', skill: 'count2', goal: 'Count dimes by 10s and quarters by 25s.', key: 'Count dimes by 10s. Count quarters by 25s: 25, 50, 75, 100.', steps: [
    { t: 'explain', title: 'Count by 10s and 25s', text: ['Dimes are 10¢ each, so count by 10s.', 'Quarters are 25¢ each, so count by 25s.', 'Learn this quarter count by heart: 25, 50, 75, 100.'] },
    { t: 'coins', worked: true, title: 'Count the dimes', rows: [{ coins: 'ddd', labels: ['10¢', '20¢', '30¢'] }], text: ['10, 20, 30. Three dimes make 30¢.'] },
    { t: 'coins', worked: true, title: 'Count the quarters', rows: [{ coins: 'qqqq', labels: ['25¢', '50¢', '75¢', '100¢'] }], text: ['25, 50, 75, 100. Four quarters make 100¢.'] },
    { t: 'guided', coach: 'Touch each dime and count by 10s.', q: { k: 'num', coins: 'dddd', h: 'All dimes. Count by 10s.', h2: 'Say 10 for the first dime, 20 for the next one, and keep going.' } },
    { t: 'try', q: { k: 'num', coins: 'qq', h: 'All quarters. Count by 25s.', h2: 'Use the quarter count. Say one number for each quarter.' } },
    { t: 'try', q: { k: 'num', coins: 'ddddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s, one number for each dime.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'stack quarters and say 25, 50, 75, 100.', 'Then trade: 10 dimes make the same amount as 4 quarters.'] }
  ] },
  { id: 'E', part: 'basic', mins: 7, title: 'Count Two Kinds of Coins', skill: 'mix2', goal: 'Count two kinds of coins by starting with the coins worth the most.', key: 'Start with the coins worth the most. Then count on.', steps: [
    { t: 'explain', title: 'Two kinds together', text: ['When there are two kinds of coins, start with the coins worth the most.', 'Then COUNT ON with the other coins. Do not start over at zero!'], box: ['2 dimes and 3 pennies:', 'Dimes first: 10, 20.', 'Count on with the pennies: 21, 22, 23. That makes 23¢.'] },
    { t: 'coins', worked: true, title: 'Watch me count', rows: [{ coins: 'ddppp', labels: ['10¢', '20¢', '21¢', '22¢', '23¢'] }], text: ['10, 20, then 21, 22, 23. Total: 23¢.'] },
    { t: 'coins', worked: true, title: 'A quarter and nickels', rows: [{ coins: 'qnn', labels: ['25¢', '30¢', '35¢'] }], text: ['Quarter first: 25. Then count on by 5s: 30, 35. Total: 35¢.'] },
    { t: 'guided', coach: 'Start with the quarter: 25. Then count on 10 for each dime.', q: { k: 'num', coins: 'qdd', h: 'Which coin is worth the most? Start there.', h2: 'Say 25 for the quarter. Then keep going by 10s for the dimes.' } },
    { t: 'try', q: { k: 'num', coins: 'nnnpppp', h: 'Count the nickels first, then the pennies.', h2: 'Count the nickels by 5s. Then count on by 1s for each penny.' } },
    { t: 'try', q: { k: 'num', coins: 'qqn', h: 'Count the quarters first.', h2: 'Use the quarter count for the quarters. Then count on 5 for the nickel.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'put 2 dimes and some pennies on the table.', 'Count the dimes first, then count on with the pennies.'] }
  ] },
  { id: 'F', part: 'basic', mins: 7, title: 'Count a Mixed Handful', skill: 'mix', goal: 'Count a mixed handful by sorting the coins first.', key: 'Start with the coin worth the most, then count on.', steps: [
    { t: 'explain', title: 'A mixed-up handful', text: ['Real coins come all mixed up.', 'First, put them in order by value: quarters, then dimes, then nickels, then pennies.', 'Then count on, one coin at a time.'] },
    { t: 'coins', worked: true, title: 'Sort first', rows: [{ coins: 'pdqn', labels: ['penny', 'dime', 'quarter', 'nickel'] }, { coins: 'qdnp', labels: ['25¢', '35¢', '40¢', '41¢'] }], text: ['Mixed up on top. Sorted below: quarter, dime, nickel, penny.', 'Count on: 25, 35, 40, 41. Total: 41¢.'] },
    { t: 'guided', coach: 'In your head, put the coins in order. Start with the quarter, then the dimes, then the nickel, then the pennies.', q: { k: 'num', coins: 'dnqdpp', h: 'Find the coin worth the most and start there.', h2: 'Start at 25. Count on 10 for each dime, 5 for the nickel, and 1 for each penny.' } },
    { t: 'try', q: { k: 'num', coins: 'ndqpq', h: 'Sort the coins in your head: the coins worth the most go first.', h2: 'Count both quarters first. Then count on the dime, the nickel, and the penny.' } },
    { t: 'try', q: { k: 'num', coins: 'pdnndp', h: 'Which coins are worth the most here?', h2: 'There is no quarter. Count the dimes first, then the nickels, then the pennies.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'ask a grown-up for a small handful of change.', 'Sort it into four piles, then count it, starting with the coins worth the most.', 'Have the grown-up check your total.'] }
  ] },
  { id: 'G', part: 'basic', mins: 9, title: 'Make an Amount', skill: 'make', goal: 'Choose coins that add up to an amount.', key: 'Many coin sets can make the same amount. Use the fewest coins only when the question says so.', steps: [
    { t: 'explain', title: 'Make the amount', text: ['Now YOU choose the coins.', 'A good way: start with the coin worth the most that is not more than the amount.', 'Add more coins until you reach the amount exactly.'], box: ['Make 35¢:', 'A quarter is 25¢. That is not more than 35¢. Take it.', 'Add a dime: 25 + 10 = 35¢. Stop!'] },
    { t: 'explain', title: 'How to use the tray', text: ['Tap a coin to put it in the tray.', 'Tap a coin in the tray to take it back out. Undo takes out the last coin. Clear empties the tray.', 'Press Check when you think you have it.'] },
    { t: 'guided', coach: 'Watch the running total as you add coins. Stop when it says 35¢.', q: { k: 'tray', target: 35, h: 'Start with a quarter. How much more do you need?', h2: 'After the quarter, you need 35 − 25 more cents. Which coin is worth that much?' } },
    { t: 'try', q: { k: 'tray', target: 40, h: 'Start with the coin worth the most that is not more than 40¢.', h2: 'After a quarter, how much more do you need? Which coins make that much?' } },
    { t: 'explain', title: 'More than one right way', text: ['There is usually more than one way to make an amount.', 'Any coins that add up to exactly the amount are right, unless the question gives a rule.'], box: ['30¢ = 3 dimes', '30¢ = a quarter and a nickel', '30¢ = 6 nickels'] },
    { t: 'try', q: { k: 'mc', q: 'Which coins make 30¢ in a different way than a quarter and a nickel?', opts: ['ddd', 'ddn', 'qd'], want: 30, h: 'Count each choice.', h2: 'Count by 10s for dimes and by 5s for nickels. Which choice reaches exactly 30¢?', ex: '3 dimes: 10, 20, 30. That is 30¢, another way to make it.', why: [null, '2 dimes and a nickel make 25¢.', 'A quarter and a dime make 35¢.'] } },
    { t: 'explain', title: 'When the question says FEWEST', text: ['Sometimes a question says: use the FEWEST coins. Then you need the smallest number of coins that still makes the amount.', 'This rule only counts when the question says it.'], box: ['Make 30¢ with the FEWEST coins:', 'A quarter and a nickel = 2 coins.', '3 dimes = 3 coins. 6 nickels = 6 coins.', 'The fewest is 2 coins.'] },
    { t: 'try', q: { k: 'tray', target: 20, fewest: true, h: 'Use as few coins as you can.', h2: 'Is a quarter too much? Which coin worth the most still fits? How many of those make 20¢?' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'have a grown-up say an amount, like 27¢.', 'Make it with real coins, then count to check. Can you find a second way?'] }
  ] },
  { id: 'H', part: 'basic', mins: 8, title: 'One Dollar', skill: 'dollar', goal: 'Know that 100 cents make one dollar, and read dollar amounts.', key: '100¢ = $1.00. Four quarters, ten dimes, or twenty nickels make one dollar.', steps: [
    { t: 'explain', title: 'One hundred cents', text: ['100 cents is the same as ONE DOLLAR.', 'We write one dollar like this: $1.00.'], box: ['4 quarters = 100¢ = $1.00', '10 dimes = 100¢ = $1.00', '20 nickels = 100¢ = $1.00'] },
    { t: 'coins', worked: true, title: 'Four quarters make a dollar', rows: [{ coins: 'qqqq', labels: ['25¢', '50¢', '75¢', '$1.00'] }], text: ['25, 50, 75, 100. That is $1.00.'] },
    { t: 'explain', title: 'Reading dollars and cents', text: ['The number before the dot is dollars. The two numbers after the dot are cents.'], box: ['$1.25 = 1 dollar and 25 cents', '$1.05 = 1 dollar and 5 cents', '$0.75 = 75 cents (no dollars)'] },
    { t: 'guided', coach: 'Use only quarters. Count by 25s until you reach 100.', q: { k: 'tray', target: 100, only: 'q', h: 'How many quarters make 100¢?', h2: 'Count by 25s as you tap each quarter.' } },
    { t: 'try', q: { k: 'mc', q: 'Which is the same as $1.00?', opts: ['dddd', 'qqqq', 'nnnnnnnnnn'], want: 100, h: 'Count each choice. Which one makes 100¢?', h2: 'Count by 10s for dimes, by 25s for quarters, and by 5s for nickels.', ex: '4 quarters: 25, 50, 75, 100. That is $1.00.', why: ['4 dimes make 40¢.', null, '10 nickels make 50¢.'] } },
    { t: 'try', q: { k: 'mc', q: 'How do you write one dollar and thirty cents?', c: ['$130', '$1.30', '1.30¢'], a: 1, h: 'Dollars go before the dot. Cents go after it.', h2: 'Write the dollar sign, then the dollars, then a dot, then two digits for the cents.', ex: '$1.30 means 1 dollar and 30 cents.', why: ['$130 means one hundred thirty dollars.', null, 'When you use the dollar sign, you do not also write ¢.'] } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'make $1.00 with quarters. Then make $1.00 with dimes.', 'Which way uses more coins? Are they worth the same?'] }
  ] },
  { id: 'I', part: 'apply', mins: 10, title: 'Compare and Solve', skill: 'compare', goal: 'Compare two amounts, find how much more is needed, and solve store problems.', key: 'Count each amount first. More coins does not always mean more money. Add the prices; subtract to find what is missing.', steps: [
    { t: 'explain', title: 'Who has more?', text: ['To compare money, count each amount first. Then compare the totals.', 'The person with MORE COINS does not always have more money!'] },
    { t: 'coins', worked: true, title: 'Compare two amounts', groups: [{ label: 'Ava has:', coins: 'qq' }, { label: 'Ben has:', coins: 'dddd' }], text: ['Ava: 25, 50. That is 50¢ with 2 coins.', 'Ben: 10, 20, 30, 40. That is 40¢ with 4 coins.', 'Ava has more money, even with fewer coins. 50 − 40 = 10, so Ava has 10¢ more.'] },
    { t: 'guided', coach: 'Count Maya’s coins. Then count Leo’s coins. Compare the two totals.', q: { k: 'mc', q: 'Who has more money?', groups: [{ label: 'Maya', coins: 'qd' }, { label: 'Leo', coins: 'nnnnn' }], cmp: 'more', h: 'Count each person’s money first.', h2: 'Write down both totals. Which number is greater?', ex: 'Maya has 25 + 10 = 35¢. Leo has 5 nickels, which is 25¢. Maya has more money, even though Leo has more coins.', why: [null, 'Leo has more coins, but 5 nickels make only 25¢. Maya has 35¢.'] } },
    { t: 'explain', title: 'How much more do you need?', text: ['Sometimes you do not have enough money yet.', 'Count what you have. Then count up to the price, or subtract.'], box: ['You have 2 dimes (20¢). A juice box costs 45¢.', 'Count up from 20: 30, 40, 45. That is 10 + 10 + 5 = 25.', 'Or subtract: 45 − 20 = 25. You need 25¢ more.'] },
    { t: 'try', q: { k: 'num', coins: 'qn', price: 50, q: 'You have these coins. A baseball card costs 50¢. How much more money do you need?', h: 'Count your coins first.', h2: 'After you count your coins, count up from your total to 50.', ex: 'You have 25 + 5 = 30¢. Count up from 30 to 50: that is 20 more. You need 20¢ more.' } },
    { t: 'explain', title: 'Two-step store problems', text: ['Some problems have two steps. Do one step at a time.'], box: ['A pencil costs 25¢. An eraser costs 15¢. You buy both.', 'Step 1: add the prices. 25 + 15 = 40¢.', 'You pay with 2 quarters, which is 50¢.', 'Step 2: subtract. 50 − 40 = 10. Your change is 10¢.'] },
    { t: 'guided', coach: 'Add the two prices. Count on from the larger price.', q: { k: 'num', prices: [30, 20], q: 'At the school store, a pencil costs 30¢ and a sticker costs 20¢. How much do they cost together?', h: 'Together means add.', h2: 'Start at 30 and count on 20 more by 10s.', ex: '30 + 20 = 50. Together they cost 50¢.' } },
    { t: 'try', q: { k: 'num', prices: [35, 10], paid: 50, q: 'You buy a granola bar for 35¢ and a sticker for 10¢. You pay with 2 quarters (50¢). How much change do you get?', h: 'There are two steps. First find the total cost.', h2: 'Step 1: add the two prices. Step 2: subtract that total from 50.', ex: 'Step 1: 35 + 10 = 45¢. Step 2: 50 − 45 = 5. You get 5¢ change.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: ['Play store at home. Put price tags on three snacks, each under $1.00.', 'Pay with real coins and count your change. Then trade jobs with your grown-up.'] }
  ] },
  { id: 'J', part: 'apply', mins: 9, title: 'Find the Change', skill: 'change', goal: 'Find the change from $1.00 by counting up and by subtracting.', key: 'Change = what you paid minus the price. Count up from the price to $1.00, or subtract from 100.', steps: [
    { t: 'explain', title: 'What is change?', text: ['When you pay more than something costs, you get money back. That money is called CHANGE.', 'There are two good ways to find it: count up from the price, or subtract the price from what you paid.'] },
    { t: 'coins', worked: true, title: 'Way 1: count up from the price', rows: [{ label: 'A snack costs 65¢. You pay $1.00. Start at 65¢ and add coins:', coins: 'dq', labels: ['75¢', '$1.00'] }], text: ['Start at 65. Add a dime: 75. Add a quarter: 100.', 'The coins you added are the change: 10¢ + 25¢ = 35¢.'] },
    { t: 'explain', title: 'Way 2: subtract', text: ['You paid 100¢. The snack cost 65¢.', 'Both ways give the same answer. Check it: price + change should make $1.00.'], box: ['100 − 65 = 35. The change is 35¢.', 'Check: 65 + 35 = 100. ✓'] },
    { t: 'guided', coach: 'Start at 80¢ in your head. Add coins until you reach $1.00. The coins in the tray are the change.', q: { k: 'tray', target: 20, q: 'Juice costs 80¢. You pay with $1.00. Put the change in the tray. Count up from 80¢ to $1.00.', h: 'Start at 80. What coin gets you closer to 100?', h2: 'Count up by 10s from 80. How many 10s reach 100?', ex: 'From 80, two dimes count up: 90, 100. The change is 20¢. Any coins that make 20¢ are right.' } },
    { t: 'try', q: { k: 'num', prices: [70], paid: 100, q: 'A bag of crackers costs 70¢. You pay with $1.00. How much change do you get?', h: 'Count up from 70 to 100, or subtract 70 from 100.', h2: 'Count up from 70 by 10s. How many 10s does it take to reach 100?', ex: '100 − 70 = 30. Count up: 80, 90, 100. You get 30¢ change.' } },
    { t: 'try', q: { k: 'num', prices: [45], paid: 100, q: 'A pencil costs 45¢. You pay with $1.00. How much change do you get?', h: 'Count up from 45 to 100.', h2: 'Count up from 45 to 50 first. Then count up from 50 to 100.', ex: '45 to 50 is 5. 50 to 100 is 50. 5 + 50 = 55. You get 55¢ change. Check: 45 + 55 = 100.' } },
    { t: 'explain', title: 'Off the screen (optional)', text: [REAL_COINS + 'a grown-up "sells" you something for less than $1.00.', 'You pay with 4 quarters. The grown-up counts up the change out loud, then you check it.'] }
  ] }
];

/* Practice bank (separate from the check bank below) */
var MONEY_BANK = [
  // names
  { id: 'mo1', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the nickel?', c: ['q', 'n', 'd'], a: 1, h: 'The nickel is silver. Is it the largest, the smallest, or in between?', h2: 'Put the three silver coins in order by size in your head. The nickel is the one in the middle.', ex: 'The nickel is silver. It is larger than a dime and smaller than a quarter.', why: ['That is a quarter, the largest coin.', null, 'That is a dime, the smallest coin.'] },
  { id: 'mo2', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the dime?', c: ['p', 'd', 'q'], a: 1, h: 'The dime is silver. Is it large or small?', h2: 'The penny and the dime are both small. Look at their colors.', ex: 'The dime is the smallest silver coin.', why: ['That is a penny. It is copper colored.', null, 'That is a quarter, the largest coin.'] },
  { id: 'mo3', sk: 'names', k: 'mc', coins: 'D', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['nickel', 'dime', 'quarter'], a: 1, h: 'Read the words on the coin.', h2: 'The big words at the bottom name the coin.', ex: 'It is a dime. The words say ONE DIME, and the back shows a torch.', why: ['A nickel says FIVE CENTS and shows a building.', null, 'A quarter says QUARTER DOLLAR.'] },
  { id: 'mo4', sk: 'names', k: 'mc', coins: 'Q', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['quarter', 'nickel', 'penny'], a: 0, h: 'Is it silver or copper? Then read the words.', h2: 'Read the words along the bottom of the coin.', ex: 'It is a quarter. The words say QUARTER DOLLAR.', why: [null, 'A nickel says FIVE CENTS on the back.', 'A penny is copper colored and says ONE CENT.'] },
  { id: 'mo5', sk: 'names', k: 'mc', q: 'Which coin is copper colored?', c: ['dime', 'penny', 'nickel'], a: 1, h: 'Only one coin is not silver.', h2: 'Think of the brown-orange coin from the lesson.', ex: 'The penny is the only copper-colored coin.', why: ['A dime is silver colored.', null, 'A nickel is silver colored.'] },
  { id: 'mo6', sk: 'names', k: 'mc', cc: true, q: 'Which coin is the quarter?', c: ['d', 'n', 'q'], a: 2, h: 'The quarter is silver. Is it large or small?', h2: 'Compare the sizes of the three coins.', ex: 'The quarter is the largest coin.', why: ['That is a dime, the smallest coin.', 'That is a nickel. It is smaller than a quarter.', null] },
  // values
  { id: 'mo7', sk: 'values', k: 'mc', coins: 'n', q: 'How much is this coin worth?', c: ['10¢', '5¢', '1¢', '25¢'], a: 1, h: 'Name the coin first.', h2: 'It is silver and medium-size. Name it, then say its value.', ex: 'It is a nickel. A nickel is worth 5¢.', why: ['10¢ is a dime.', null, '1¢ is a penny.', '25¢ is a quarter.'] },
  { id: 'mo8', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 10¢?', c: ['n', 'd', 'q'], a: 1, h: 'Name each coin first.', h2: 'Say each coin’s name and value out loud. Stop when you say 10¢.', ex: 'The dime is worth 10¢, even though it is the smallest coin.', why: ['The nickel is worth 5¢.', null, 'The quarter is worth 25¢.'] },
  { id: 'mo9', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth LESS?', c: ['d', 'n'], a: 1, h: 'Name both coins and say their values.', h2: 'Do not go by size. Say the value of each coin, then compare the numbers.', ex: 'The nickel (5¢) is worth less than the dime (10¢), even though the nickel is larger.', why: ['That is the dime. It is small, but it is worth 10¢.', null] },
  { id: 'mo10', sk: 'values', k: 'mc', q: 'A penny is worth ___.', c: ['1¢', '5¢', '10¢'], a: 0, h: 'The penny is worth the least of all the coins.', h2: 'Think of counting pennies: 1, 2, 3... Each penny adds how much?', ex: 'A penny is worth 1¢.', why: [null, '5¢ is a nickel.', '10¢ is a dime.'] },
  { id: 'mo11', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 25¢?', c: ['q', 'n', 'p'], a: 0, h: 'Name each coin first.', h2: 'Say each coin’s name and value out loud. Stop when you say 25¢.', ex: 'The quarter is worth 25¢.', why: [null, 'The nickel is worth 5¢.', 'The penny is worth 1¢.'] },
  { id: 'mo12', sk: 'values', k: 'mc', coins: 'P', q: 'This is the back of a coin. How much is it worth?', c: ['1¢', '10¢', '5¢'], a: 0, h: 'What color is it? Read the words too.', h2: 'Read the words on the shield. They name the coin.', ex: 'It is a penny. The words say ONE CENT. A penny is worth 1¢.', why: [null, 'A dime is silver colored.', 'A nickel is silver colored.'] },
  // count1
  { id: 'mo13', sk: 'count1', k: 'num', coins: 'ppppp', h: 'All pennies. Count by 1s.', h2: 'Touch each penny and count: 1, 2, 3...' },
  { id: 'mo14', sk: 'count1', k: 'num', coins: 'pppppppp', h: 'All pennies. Count by 1s.', h2: 'Count carefully, one number for each penny.' },
  { id: 'mo15', sk: 'count1', k: 'num', coins: 'nnnn', h: 'All nickels. Count by 5s.', h2: 'Say 5 for the first nickel, 10 for the next one...' },
  { id: 'mo16', sk: 'count1', k: 'num', coins: 'nnnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s, one number for each nickel.' },
  { id: 'mo17', sk: 'count1', k: 'num', coins: 'nn', h: 'All nickels. Count by 5s.', h2: 'Say 5 for the first nickel. What comes next when you count by 5s?' },
  { id: 'mo18', sk: 'count1', k: 'num', coins: 'nnnnnnnn', h: 'All nickels. Count by 5s.', h2: 'Count by 5s. Touch each nickel as you count.' },
  // count2
  { id: 'mo19', sk: 'count2', k: 'num', coins: 'dd', h: 'All dimes. Count by 10s.', h2: 'Say 10 for the first dime. What comes next when you count by 10s?' },
  { id: 'mo20', sk: 'count2', k: 'num', coins: 'ddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s, one number for each dime.' },
  { id: 'mo21', sk: 'count2', k: 'num', coins: 'dddddd', h: 'All dimes. Count by 10s.', h2: 'Touch each dime: 10, 20, 30...' },
  { id: 'mo22', sk: 'count2', k: 'num', coins: 'qq', h: 'All quarters. Count by 25s.', h2: 'Use the quarter count you learned. Say one number for each quarter.' },
  { id: 'mo23', sk: 'count2', k: 'num', coins: 'qQqQ', h: 'All quarters. Some show heads and some show tails. Count by 25s.', h2: 'Heads or tails, each quarter is worth the same. Use the quarter count.' },
  { id: 'mo24', sk: 'count2', k: 'num', coins: 'ddddddddd', h: 'All dimes. Count by 10s.', h2: 'Count by 10s. Touch each dime as you count.' },
  // mix2
  { id: 'mo25', sk: 'mix2', k: 'num', coins: 'dppp', h: 'Count the dime first, then the pennies.', h2: 'Start at 10. Then count on 1 for each penny.' },
  { id: 'mo26', sk: 'mix2', k: 'num', coins: 'nnpp', h: 'Nickels first, then pennies.', h2: 'Count the nickels by 5s. Then count on by 1s.' },
  { id: 'mo27', sk: 'mix2', k: 'num', coins: 'qnn', h: 'Quarter first.', h2: 'Start at 25. Then count on 5 for each nickel.' },
  { id: 'mo28', sk: 'mix2', k: 'num', coins: 'dddnn', h: 'Dimes first, then nickels.', h2: 'Count the dimes by 10s. Then count on by 5s.' },
  { id: 'mo29', sk: 'mix2', k: 'num', coins: 'qppp', h: 'Quarter first, then pennies.', h2: 'Start at 25. Then count on 1 for each penny.' },
  { id: 'mo30', sk: 'mix2', k: 'num', coins: 'qqddd', h: 'Quarters first, then dimes.', h2: 'Use the quarter count for the quarters. Then count on 10 for each dime.' },
  // mix
  { id: 'mo31', sk: 'mix', k: 'num', coins: 'nqpd', h: 'Sort in your head: quarter, dime, nickel, penny.', h2: 'Start at 25 for the quarter. Then count on the dime, the nickel, and the penny.' },
  { id: 'mo32', sk: 'mix', k: 'num', coins: 'dpqdn', h: 'Find the coin worth the most and start there.', h2: 'Quarter first. Then the two dimes, the nickel, and the penny.' },
  { id: 'mo33', sk: 'mix', k: 'num', coins: 'pqdqnp', h: 'Count the quarters first.', h2: 'Use the quarter count for both quarters. Then count on the dime, the nickel, and the pennies.' },
  { id: 'mo34', sk: 'mix', k: 'num', coins: 'dndnp', h: 'No quarters here. Which coins are worth the most?', h2: 'Dimes first by 10s. Then the nickels by 5s. Then the penny.' },
  { id: 'mo35', sk: 'mix', k: 'num', coins: 'ndppqn', h: 'Sort by value: quarter, dime, nickels, pennies.', h2: 'Start at 25. Count on the dime, then the nickels, then the pennies.' },
  { id: 'mo36', sk: 'mix', k: 'num', coins: 'pnndp', h: 'Which coin here is worth the most?', h2: 'Start with the dime. Then count on 5 for each nickel and 1 for each penny.' },
  // make
  { id: 'mo37', sk: 'make', k: 'tray', target: 30, h: 'Start with the coin worth the most that is not more than 30¢.', h2: 'After you choose your first coin, how much more do you need to reach 30¢?' },
  { id: 'mo38', sk: 'make', k: 'tray', target: 45, h: 'Start with a quarter.', h2: 'After a quarter you need 20¢ more. Which coins make 20¢?' },
  { id: 'mo39', sk: 'make', k: 'tray', target: 12, h: 'Is a quarter too much? What about a dime?', h2: 'After a dime, how many more cents do you need? Which coins are worth 1¢ each?' },
  { id: 'mo40', sk: 'make', k: 'tray', target: 60, h: 'Start with quarters. How many fit?', h2: 'Two quarters make 50¢. How much more do you need to reach 60¢?' },
  { id: 'mo41', sk: 'make', k: 'tray', target: 50, only: 'dn', h: 'You can use only dimes and nickels here.', h2: 'Count by 10s as you add dimes. Use a nickel only if you need 5 more.' },
  { id: 'mo42', sk: 'make', k: 'tray', target: 30, fewest: true, h: 'Use the FEWEST coins you can.', h2: 'Start with the coin worth the most that fits. How much is left? Can ONE coin make the rest?' },
  { id: 'mo65', sk: 'make', k: 'tray', target: 30, only: 'qd', fewest: true, h: 'You can use only quarters and dimes. Use the fewest coins.', h2: 'Try a quarter first. How much is left? Can a dime make exactly that? If not, try using only dimes.' },
  // dollar
  { id: 'mo43', sk: 'dollar', k: 'tray', target: 100, only: 'd', h: 'How many dimes make 100¢?', h2: 'Count by 10s as you tap each dime.' },
  { id: 'mo44', sk: 'dollar', k: 'mc', q: 'How do you write one dollar and twenty-five cents?', c: ['$125', '1.25¢', '$1.25'], a: 2, h: 'Dollars go before the dot. Cents go after it.', h2: 'Start with the dollar sign. Write the dollars, a dot, then two digits for the cents.', ex: '$1.25 means 1 dollar and 25 cents.', why: ['$125 means one hundred twenty-five dollars.', 'With a dollar amount, use the $ sign, not ¢.', null] },
  { id: 'mo45', sk: 'dollar', k: 'num', q: 'How many cents are in one dollar?', ans: 100, h: 'Think: how many pennies make a dollar?', h2: 'Think of the quarter count you learned. Where does it stop?', ex: 'There are 100 cents in one dollar.' },
  { id: 'mo46', sk: 'dollar', k: 'mc', q: 'Which coins make exactly $1.00?', opts: ['qqqdd', 'qqqddn', 'qqddd'], want: 100, h: 'Count each choice, starting with the quarters.', h2: 'Count each choice: quarters first, then count on. Which one stops at exactly 100?', ex: '25, 50, 75, then 85, 95, then 100. That is $1.00.', why: ['That makes 95¢.', null, 'That makes 80¢.'] },
  { id: 'mo47', sk: 'dollar', k: 'mc', q: 'What does $0.60 mean?', c: ['60 dollars', '60 cents', '6 cents'], a: 1, h: 'Look at the number before the dot.', h2: 'A 0 before the dot means no dollars. The two digits after the dot are the cents.', ex: '$0.60 means 60 cents.', why: ['60 dollars would be written $60.00.', null, '6 cents would be written $0.06.'] },
  { id: 'mo48', sk: 'dollar', k: 'tray', target: 100, only: 'q', h: 'How many quarters make a dollar?', h2: 'Count by 25s as you tap.' },
  // compare (Lesson I)
  { id: 'mo49', sk: 'compare', k: 'mc', q: 'Who has more money?', groups: [{ label: 'Sam', coins: 'dddd' }, { label: 'Tia', coins: 'qp' }], cmp: 'more', h: 'Count each amount first.', h2: 'Write down both totals. Which number is greater?', ex: 'Sam has 4 dimes: 40¢. Tia has 25 + 1 = 26¢. Sam has more.', why: [null, 'Tia has 26¢. Sam has 40¢.'] },
  { id: 'mo50', sk: 'compare', k: 'mc', q: 'Who has LESS money?', groups: [{ label: 'Jada', coins: 'nnnnnn' }, { label: 'Omar', coins: 'qd' }], cmp: 'less', h: 'Count each amount first.', h2: 'Find both totals. Which number is smaller? More coins does not always mean more money.', ex: 'Jada has 6 nickels: 30¢. Omar has 25 + 10 = 35¢. Jada has less money, even with more coins.', why: [null, 'Omar has 35¢. Jada has only 30¢.'] },
  { id: 'mo51', sk: 'compare', k: 'num', groups: [{ label: 'Kai has:', coins: 'qqd' }, { label: 'Zoe has:', coins: 'ddd' }], diff: true, q: 'How much more money does Kai have than Zoe?', h: 'Count both amounts first.', h2: 'Find both totals. Then count up from the smaller total to the larger one.', ex: 'Kai has 25 + 25 + 10 = 60¢. Zoe has 30¢. 60 − 30 = 30. Kai has 30¢ more.' },
  { id: 'mo52', sk: 'compare', k: 'num', coins: 'dd', price: 35, q: 'You have these coins. A pack of stickers costs 35¢. How much more money do you need?', h: 'Count your coins first.', h2: 'Count up from your total to 35.', ex: 'You have 20¢. Count up from 20 to 35: that is 15. You need 15¢ more.' },
  { id: 'mo53', sk: 'compare', k: 'num', prices: [40, 25], q: 'A juice box costs 40¢ and an apple costs 25¢. How much do they cost together?', h: 'Together means add.', h2: 'Start at 40. Count on 25 more: 10, 10, and 5.', ex: '40 + 25 = 65. Together they cost 65¢.' },
  { id: 'mo54', sk: 'compare', k: 'num', prices: [20, 15], paid: 50, q: 'You buy a pencil for 20¢ and an eraser for 15¢. You pay with 2 quarters (50¢). How much change do you get?', h: 'Two steps: first find the total cost.', h2: 'Step 1: add the two prices. Step 2: subtract that total from 50.', ex: 'Step 1: 20 + 15 = 35¢. Step 2: 50 − 35 = 15. You get 15¢ change.' },
  { id: 'mo55', sk: 'compare', k: 'num', coins: 'qdn', price: 60, q: 'You have these coins. A baseball card costs 60¢. How much more money do you need?', h: 'Count your coins first, starting with the quarter.', h2: 'After you count your coins, count up from your total to 60.', ex: 'You have 25 + 10 + 5 = 40¢. 60 − 40 = 20. You need 20¢ more.' },
  { id: 'mo56', sk: 'compare', k: 'num', prices: [35, 35], q: 'You buy 2 granola bars. Each one costs 35¢. How much do you spend in all?', h: 'Add the price two times.', h2: 'Start at 35. Count on 35 more: 30 and then 5.', ex: '35 + 35 = 70. You spend 70¢.' },
  // change (Lesson J)
  { id: 'mo57', sk: 'change', k: 'num', prices: [75], paid: 100, q: 'A bottle of water costs 75¢. You pay with $1.00. How much change do you get?', h: 'Count up from 75 to 100.', h2: 'Which ONE coin takes you from 75 to 100?', ex: '100 − 75 = 25. You get 25¢ change, one quarter.' },
  { id: 'mo58', sk: 'change', k: 'num', prices: [60], paid: 100, q: 'A bag of pretzels costs 60¢. You pay with $1.00. How much change do you get?', h: 'Count up from 60 to 100.', h2: 'Count up by 10s from 60. How many 10s reach 100?', ex: '100 − 60 = 40. Count up: 70, 80, 90, 100. You get 40¢ change.' },
  { id: 'mo59', sk: 'change', k: 'num', prices: [85], paid: 100, q: 'A pencil grip costs 85¢. You pay with $1.00. How much change do you get?', h: 'Count up from 85 to 100.', h2: 'Count up from 85 to 90 first. Then from 90 to 100.', ex: '85 to 90 is 5. 90 to 100 is 10. 5 + 10 = 15. You get 15¢ change.' },
  { id: 'mo60', sk: 'change', k: 'num', prices: [40], paid: 100, q: 'A pack of baseball cards costs 40¢. You pay with $1.00. How much change do you get?', h: 'Subtract 40 from 100, or count up.', h2: 'Count up by 10s from 40 to 100.', ex: '100 − 40 = 60. You get 60¢ change.' },
  { id: 'mo61', sk: 'change', k: 'tray', target: 30, q: 'An apple costs 70¢. You pay with $1.00. Put the change in the tray. Count up from 70¢ to $1.00.', h: 'Start at 70 in your head. Add coins until you reach 100.', h2: 'Count up by 10s from 70. Or think: 100 − 70.', ex: 'From 70, count up 80, 90, 100. The change is 30¢. Any coins that make 30¢ are right.' },
  { id: 'mo62', sk: 'change', k: 'num', prices: [55], paid: 100, q: 'A granola bar costs 55¢. You pay with $1.00. How much change do you get?', h: 'Count up from 55 to 100.', h2: 'Count up from 55 to 60 first. Then from 60 to 100.', ex: '55 to 60 is 5. 60 to 100 is 40. 5 + 40 = 45. You get 45¢ change.' },
  { id: 'mo63', sk: 'change', k: 'num', prices: [90], paid: 100, q: 'A sheet of stickers costs 90¢. You pay with $1.00. How much change do you get?', h: 'How far is 90 from 100?', h2: 'Count up from 90 to 100.', ex: '100 − 90 = 10. You get 10¢ change.' },
  { id: 'mo64', sk: 'change', k: 'mc', q: 'A snack costs 65¢. You pay with $1.00. Which coins are the right change?', opts: ['qd', 'qn', 'ddd'], prices: [65], paid: 100, h: 'First find the change. Then count each choice.', h2: 'Count up from 65 to 100. Then count each choice to see which one matches.', ex: 'The change is 100 − 65 = 35¢. A quarter and a dime make 25 + 10 = 35¢.', why: [null, 'A quarter and a nickel make 30¢. That is 5¢ too little.', '3 dimes make 30¢. That is 5¢ too little.'] }
];

/* Check My Skills bank: questions that do not appear in the lessons or in practice.
   Overlap is tested with normalized keys in test-money.js. */
var MONEY_CHECK = [
  { id: 'mc1', sk: 'names', k: 'mc', cc: true, q: 'These are the BACKS of three coins. Which one is the back of a dime?', c: ['Q', 'D', 'N'], a: 1, h: 'Read the words on each coin.', h2: 'The words at the bottom name the coin.', ex: 'The back of a dime shows a torch and says ONE DIME.', why: ['That is the back of a quarter. It says QUARTER DOLLAR.', null, 'That is the back of a nickel. It says FIVE CENTS.'] },
  { id: 'mc2', sk: 'names', k: 'mc', coins: 'N', q: 'This is the back (tails) of a coin. Which coin is it?', c: ['dime', 'quarter', 'nickel'], a: 2, h: 'Read the words on the coin.', h2: 'The words at the bottom name the coin.', ex: 'It is a nickel. It shows a building and says FIVE CENTS.', why: ['A dime says ONE DIME.', 'A quarter says QUARTER DOLLAR.', null] },
  { id: 'mc3', sk: 'names', k: 'mc', coins: 'p', q: 'Which coin is this?', c: ['dime', 'penny', 'nickel'], a: 1, h: 'What color is it?', h2: 'Only one coin is copper colored.', ex: 'It is a penny, the copper-colored coin.', why: ['A dime is silver colored.', null, 'A nickel is silver colored.'] },
  { id: 'mc4', sk: 'names', k: 'mc', coins: 'q', q: 'Which coin is this?', c: ['nickel', 'quarter', 'dime'], a: 1, h: 'How large is it? What color?', h2: 'Look at the size and the color.', ex: 'It is a quarter: the largest silver coin.', why: ['A nickel is smaller.', null, 'A dime is the smallest coin.'] },
  { id: 'mc5', sk: 'values', k: 'mc', coins: 'd', q: 'How much is this coin worth?', c: ['5¢', '1¢', '10¢', '25¢'], a: 2, h: 'Name the coin first.', h2: 'Small and silver. Name it, then say its value.', ex: 'It is a dime. A dime is worth 10¢.', why: ['5¢ is a nickel.', '1¢ is a penny.', null, '25¢ is a quarter.'] },
  { id: 'mc6', sk: 'values', k: 'mc', cc: true, q: 'Which coin is worth 5¢?', c: ['d', 'p', 'n'], a: 2, h: 'Say each coin’s value.', h2: 'Do not go by size.', ex: 'The nickel is worth 5¢.', why: ['The dime is worth 10¢.', 'The penny is worth 1¢.', null] },
  { id: 'mc7', sk: 'values', k: 'mc', cc: true, q: 'These are the backs of two coins. Which coin is worth MORE?', c: ['Q', 'D'], a: 0, h: 'Name the coins, then compare their values.', h2: 'Read the words on each coin.', ex: 'The quarter (25¢) is worth more than the dime (10¢).', why: [null, 'That is a dime, worth 10¢. The quarter is worth 25¢.'] },
  { id: 'mc8', sk: 'values', k: 'mc', coins: 'Q', q: 'This is the back of a coin. How much is it worth?', c: ['10¢', '25¢', '5¢'], a: 1, h: 'Which coin is it?', h2: 'Read the words on the coin.', ex: 'It is a quarter, worth 25¢.', why: ['10¢ is a dime.', null, '5¢ is a nickel.'] },
  { id: 'mc9', sk: 'count1', k: 'num', coins: 'ppppppp', h: 'Count by 1s.', h2: 'One number for each penny.' },
  { id: 'mc10', sk: 'count1', k: 'num', coins: 'nnnnnnnnn', h: 'Count by 5s.', h2: 'One number for each nickel.' },
  { id: 'mc11', sk: 'count1', k: 'num', coins: 'nnnnnnn', h: 'Count by 5s.', h2: 'One number for each nickel.' },
  { id: 'mc12', sk: 'count1', k: 'num', coins: 'pppppppppp', h: 'Count by 1s.', h2: 'Count carefully.' },
  { id: 'mc13', sk: 'count2', k: 'num', coins: 'dddddddddd', h: 'Count by 10s.', h2: 'One number for each dime.' },
  { id: 'mc14', sk: 'count2', k: 'num', coins: 'dddddddd', h: 'Count by 10s.', h2: 'One number for each dime.' },
  { id: 'mc15', sk: 'count2', k: 'num', coins: 'QqQ', h: 'Count by 25s.', h2: 'Heads or tails, each quarter is worth the same.' },
  { id: 'mc17', sk: 'mix2', k: 'num', coins: 'ddpp', h: 'Dimes first.', h2: 'Then count on the pennies.' },
  { id: 'mc18', sk: 'mix2', k: 'num', coins: 'qqd', h: 'Quarters first.', h2: 'Then count on the dime.' },
  { id: 'mc19', sk: 'mix2', k: 'num', coins: 'nnnp', h: 'Nickels first.', h2: 'Then count on the penny.' },
  { id: 'mc20', sk: 'mix2', k: 'num', coins: 'qdddd', h: 'Quarter first.', h2: 'Then count on the dimes.' },
  { id: 'mc21', sk: 'mix', k: 'num', coins: 'pdqdd', h: 'Sort first.', h2: 'Coins worth the most first, then count on.' },
  { id: 'mc22', sk: 'mix', k: 'num', coins: 'nqnpd', h: 'Sort first.', h2: 'Coins worth the most first, then count on.' },
  { id: 'mc23', sk: 'mix', k: 'num', coins: 'dqpqq', h: 'Sort first.', h2: 'Coins worth the most first, then count on.' },
  { id: 'mc24', sk: 'mix', k: 'num', coins: 'ppndpp', h: 'Sort first.', h2: 'Coins worth the most first, then count on.' },
  { id: 'mc25', sk: 'make', k: 'tray', target: 55, h: 'Coin worth the most that fits first.', h2: 'Then add more coins.' },
  { id: 'mc26', sk: 'make', k: 'tray', target: 22, h: 'Coin worth the most that fits first.', h2: 'Then add more coins.' },
  { id: 'mc27', sk: 'make', k: 'tray', target: 70, h: 'Coin worth the most that fits first.', h2: 'Then add more coins.' },
  { id: 'mc28', sk: 'make', k: 'tray', target: 65, fewest: true, h: 'Use the fewest coins.', h2: 'Coin worth the most that fits first.' },
  { id: 'mc45', sk: 'make', k: 'tray', target: 40, only: 'qd', fewest: true, h: 'Only quarters and dimes. Fewest coins.', h2: 'Check whether a quarter leaves an amount dimes can make.' },
  { id: 'mc29', sk: 'dollar', k: 'mc', q: 'Which coins make exactly $1.00?', opts: ['qqddddd', 'qqdddd', 'qqqnnn'], want: 100, h: 'Count each choice.', h2: 'Quarters first, then count on.', ex: '2 quarters and 5 dimes: 25, 50, then 60, 70, 80, 90, 100. That is $1.00.', why: [null, 'That makes 90¢.', 'That makes 90¢.'] },
  { id: 'mc30', sk: 'dollar', k: 'mc', q: 'How do you write one dollar and forty cents?', c: ['$1.40', '$140', '1.40¢'], a: 0, h: 'Dollars before the dot, cents after.', h2: 'Use the $ sign and a dot.', ex: '$1.40 means 1 dollar and 40 cents.', why: [null, '$140 means one hundred forty dollars.', 'With the $ sign, do not also write ¢.'] },
  { id: 'mc31', sk: 'dollar', k: 'mc', q: 'What does $0.85 mean?', c: ['85 dollars', '85 cents', '8 cents'], a: 1, h: 'Look at the number before the dot.', h2: 'A 0 before the dot means no dollars.', ex: '$0.85 means 85 cents.', why: ['85 dollars would be written $85.00.', null, '8 cents would be written $0.08.'] },
  { id: 'mc32', sk: 'dollar', k: 'tray', target: 100, only: 'n', h: 'Count by 5s to 100.', h2: 'Tap nickels and count by 5s.' },
  // compare
  { id: 'mc33', sk: 'compare', k: 'mc', q: 'Who has more money?', groups: [{ label: 'Ella', coins: 'nnnnnnn' }, { label: 'Max', coins: 'qdd' }], cmp: 'more', h: 'Count each amount.', h2: 'Compare the totals, not the number of coins.', ex: 'Ella has 7 nickels: 35¢. Max has 25 + 10 + 10 = 45¢. Max has more money.', why: ['Ella has more coins, but 7 nickels make only 35¢. Max has 45¢.', null] },
  { id: 'mc34', sk: 'compare', k: 'num', groups: [{ label: 'Nia has:', coins: 'qqn' }, { label: 'Ray has:', coins: 'dddnn' }], diff: true, q: 'How much more money does Nia have than Ray?', h: 'Count both amounts.', h2: 'Subtract the smaller total from the larger total.', ex: 'Nia has 55¢. Ray has 40¢. 55 − 40 = 15. Nia has 15¢ more.' },
  { id: 'mc35', sk: 'compare', k: 'num', coins: 'qd', price: 50, q: 'You have these coins. A box of crayons costs 50¢. How much more money do you need?', h: 'Count your coins first.', h2: 'Count up from your total to 50.', ex: 'You have 35¢. 50 − 35 = 15. You need 15¢ more.' },
  { id: 'mc36', sk: 'compare', k: 'num', prices: [45, 30], q: 'A muffin costs 45¢ and a carton of milk costs 30¢. How much do they cost together?', h: 'Together means add.', h2: 'Start at 45 and count on 30.', ex: '45 + 30 = 75. Together they cost 75¢.' },
  { id: 'mc37', sk: 'compare', k: 'num', prices: [30, 15], paid: 50, q: 'You buy a ruler for 30¢ and an eraser for 15¢. You pay with 2 quarters (50¢). How much change do you get?', h: 'Two steps.', h2: 'Add the prices. Then subtract from 50.', ex: 'Step 1: 30 + 15 = 45¢. Step 2: 50 − 45 = 5. You get 5¢ change.' },
  { id: 'mc38', sk: 'compare', k: 'mc', q: 'Who has LESS money?', groups: [{ label: 'Lily', coins: 'qn' }, { label: 'Ben', coins: 'ddnnn' }], cmp: 'less', h: 'Count each amount.', h2: 'Which total is the smaller number?', ex: 'Lily has 25 + 5 = 30¢. Ben has 10 + 10 + 5 + 5 + 5 = 35¢. Lily has less money.', why: [null, 'Ben has 35¢. Lily has 30¢, which is less.'] },
  // change
  { id: 'mc39', sk: 'change', k: 'num', prices: [35], paid: 100, q: 'A pencil costs 35¢. You pay with $1.00. How much change do you get?', h: 'Count up or subtract.', h2: 'Count up from 35 to 100.', ex: '100 − 35 = 65. You get 65¢ change.' },
  { id: 'mc40', sk: 'change', k: 'num', prices: [50], paid: 100, q: 'A cookie costs 50¢. You pay with $1.00. How much change do you get?', h: 'Count up or subtract.', h2: 'Count up by 10s from the price until you reach 100.', ex: '100 − 50 = 50. You get 50¢ change.' },
  { id: 'mc41', sk: 'change', k: 'num', prices: [95], paid: 100, q: 'A box of crayons costs 95¢. You pay with $1.00. How much change do you get?', h: 'Count up or subtract.', h2: 'How far is 95 from 100?', ex: '100 − 95 = 5. You get 5¢ change.' },
  { id: 'mc42', sk: 'change', k: 'tray', target: 80, q: 'A sticker costs 20¢. You pay with $1.00. Put the change in the tray. Count up from 20¢ to $1.00.', h: 'Count up from 20 to 100.', h2: 'How much is 100 − 20?', ex: '100 − 20 = 80. The change is 80¢. Any coins that make 80¢ are right.' },
  { id: 'mc43', sk: 'change', k: 'mc', q: 'An eraser costs 15¢. You pay with $1.00. Which coins are the right change?', opts: ['qqqd', 'qqqn', 'qqddd'], prices: [15], paid: 100, h: 'Find the change first.', h2: 'Count each choice.', ex: 'The change is 100 − 15 = 85¢. 3 quarters and a dime: 25, 50, 75, 85.', why: [null, '3 quarters and a nickel make 80¢.', '2 quarters and 3 dimes make 80¢.'] },
  { id: 'mc44', sk: 'change', k: 'num', prices: [30, 25], paid: 100, q: 'You buy a pencil for 30¢ and a sticker for 25¢. You pay with $1.00. How much change do you get?', h: 'Two steps.', h2: 'Add the prices. Then subtract from 100.', ex: 'Step 1: 30 + 25 = 55¢. Step 2: 100 − 55 = 45. You get 45¢ change.' }
];
