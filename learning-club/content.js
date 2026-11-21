/* Chris's Learning Club — teaching content.
   Sentence markup:  [word]          = answer word (graded by token position)
                     [word@target]   = answer that describes/links to "target"
                     [word:tags]     = tags. Nouns: p person, l place, t thing, i idea, P proper.
                                       Adverbs: how / when / where.
   Every sentence is authored by hand. Grading never uses word lists or suffix rules. */
'use strict';

var AREAS = [
  { id: 'verbs', name: 'Verbs & Verb Teams', short: 'Verbs', mode: 'verb', icon: 'bat', blurb: 'Action words, being words, and verb teams.' },
  { id: 'nouns', name: 'Nouns', short: 'Nouns', mode: 'noun', icon: 'glove', blurb: 'Words that name people, places, things, and ideas.' },
  { id: 'adjectives', name: 'Adjectives', short: 'Adjectives', mode: 'adj', icon: 'star', blurb: 'Words that describe nouns.' },
  { id: 'adverbs', name: 'Adverbs', short: 'Adverbs', mode: 'adv', icon: 'cleats', blurb: 'Words that tell how, when, or where.' },
  { id: 'vowels', name: 'Vowel Sounds', short: 'Vowels', mode: 'vowel', icon: 'abc', blurb: 'Short vowels, long vowels, silent e, vowel teams.' },
  { id: 'reading', name: 'Reading Comprehension', short: 'Reading', mode: 'read', icon: 'book', blurb: 'Read short stories and find the evidence.' }
];

/* Skills: each skill belongs to one lesson. "optional" skills stay out of mixed rounds and checks. */
var SKILLS = {
  verbs: [
    { id: 'action', name: 'Action verbs', lesson: 'A' },
    { id: 'being', name: 'Being & standalone verbs', lesson: 'B' },
    { id: 'helpers', name: 'The 23 helping verbs', lesson: 'C' },
    { id: 'team', name: 'Whole verb teams', lesson: 'D' },
    { id: 'long', name: 'Longer verb teams', lesson: 'E', optional: true },
    { id: 'endings', name: 'Ending clues (-ed, -ing)', lesson: 'F' },
    { id: 'challenge', name: 'Challenge: words in between', lesson: 'G', optional: true }
  ],
  nouns: [
    { id: 'people', name: 'People nouns', lesson: 'A' },
    { id: 'places', name: 'Place nouns', lesson: 'B' },
    { id: 'things', name: 'Thing nouns', lesson: 'C' },
    { id: 'proper', name: 'Common & proper nouns', lesson: 'D' },
    { id: 'multi', name: 'Find every noun', lesson: 'E' },
    { id: 'ideas', name: 'Idea nouns', lesson: 'F' }
  ],
  adjectives: [
    { id: 'kind', name: 'What kind?', lesson: 'A' },
    { id: 'many', name: 'How many?', lesson: 'B' },
    { id: 'which', name: 'Which one?', lesson: 'C' },
    { id: 'link', name: 'Find the noun first', lesson: 'D' },
    { id: 'multi', name: 'More than one adjective', lesson: 'E' }
  ],
  adverbs: [
    { id: 'how', name: 'Adverbs: How?', lesson: 'A' },
    { id: 'when', name: 'Adverbs: When?', lesson: 'B' },
    { id: 'where', name: 'Adverbs: Where?', lesson: 'C' },
    { id: 'compare', name: 'Adjective or adverb?', lesson: 'D' }
  ],
  vowels: [
    { id: 'letters', name: 'Vowel letters', lesson: 'A' },
    { id: 'short', name: 'Short vowels', lesson: 'B' },
    { id: 'long', name: 'Long vowels', lesson: 'C' },
    { id: 'silente', name: 'Silent e', lesson: 'D' },
    { id: 'teams', name: 'Vowel teams', lesson: 'E' }
  ],
  reading: [
    { id: 'main', name: 'Main idea', lesson: 'A' },
    { id: 'detail', name: 'Supporting details', lesson: 'B' },
    { id: 'sequence', name: 'Sequence', lesson: 'C' },
    { id: 'inference', name: 'Making an inference', lesson: 'D' },
    { id: 'vocab', name: 'Vocabulary in context', lesson: 'E' },
    { id: 'evidence', name: 'Finding evidence', lesson: 'F' }
  ]
};

/* ───────────────────────── VERB QUESTION BANK (59) ───────────────────────── */
var VERB_BANK = [
  // Single action verbs
  { id: 'v1', sk: 'action', s: 'Chris [swings] the bat.', ask: 'What does Chris do?', h: 'Chris is doing something with the bat. Which word tells what he does?', ex: 'Swings tells what Chris does. It is an action verb.', notes: { bat: 'Bat is a thing (a noun). What does Chris DO with it?' } },
  { id: 'v2', sk: 'action', s: 'The dog [runs] outside.', ask: 'What does the dog do?', h: 'Picture the dog. What is it doing?', ex: 'Runs tells what the dog does.', notes: { outside: 'Outside tells WHERE the dog runs. It is not a verb.' } },
  { id: 'v3', sk: 'action', s: 'Mom [cooks] dinner.', ask: 'What does Mom do?', h: 'Dinner is what Mom makes. Which word is the action?', ex: 'Cooks tells what Mom does.', notes: { dinner: 'Dinner is a thing (a noun). What does Mom DO?' } },
  { id: 'v4', sk: 'action', s: 'Maya [throws] the ball to first base.', ask: 'What does Maya do?', h: 'What does Maya do with the ball?', ex: 'Throws tells what Maya does with the ball.', notes: { base: 'Base is a place. Look for the action.', first: 'First tells which base. It is not a verb.' } },
  { id: 'v5', sk: 'action', s: 'The catcher [caught] the pitch.', ask: 'What did the catcher do?', h: 'Catch changes to a new word when it happened in the past. Find it.', ex: 'Caught is the past form of catch. It tells what the catcher did.', notes: { pitch: 'Here pitch is the thing that was thrown, so it is a noun. Find what the catcher DID.' } },
  { id: 'v6', sk: 'action', s: 'Grandpa [reads] the newspaper every morning.', ask: 'What does Grandpa do?', h: 'What does Grandpa do with the newspaper?', ex: 'Reads tells what Grandpa does.', notes: { morning: 'Morning tells when. It is a noun, not a verb.', newspaper: 'Newspaper is a thing. What does Grandpa DO with it?' } },
  { id: 'v7', sk: 'action', s: 'I [think] about my next turn at bat.', ask: 'What do I do?', h: 'Some actions happen inside your head. Find that action.', ex: 'Think is an action that happens in your brain. It is a verb.', notes: { turn: 'Here turn is a thing (my turn). It is a noun in this sentence.', next: 'Next tells which turn. It is not a verb.' } },
  { id: 'v8', sk: 'action', s: 'We [learned] a new song in music class.', ask: 'What did we do?', h: 'Look for a word with an -ed ending. Then check that it shows what we did.', ex: 'Learned tells what we did. The -ed ending shows it happened in the past.', notes: { song: 'Song is a thing (a noun).', music: 'Music tells what kind of class.' } },
  { id: 'v9', sk: 'action', s: 'Jamal [wrote] a letter to his cousin.', ask: 'What did Jamal do?', h: 'Write changes to a new word in the past. Find it.', ex: 'Wrote is the past form of write. It tells what Jamal did.', notes: { letter: 'Letter is the thing Jamal made. Find the action.' } },
  { id: 'v10', sk: 'action', s: 'The players [jump] over the puddle.', ask: 'What do the players do?', h: 'What do the players do to get over the puddle?', ex: 'Jump tells what the players do.', notes: { over: 'Over tells where. It is not a verb.' } },
  { id: 'v11', sk: 'action', s: 'My sister [knows] the answer.', ask: 'What does my sister do?', h: 'This is a thinking action. What does she do with the answer?', ex: 'Knows is a thinking verb. It tells what my sister does in her mind.', notes: { answer: 'Here answer is a thing she knows, so it is a noun.' } },
  { id: 'v12', sk: 'action', s: 'The coach [clapped] for the team.', ask: 'What did the coach do?', h: 'What did the coach do with his hands?', ex: 'Clapped tells what the coach did.', notes: { team: 'Team is a group of people (a noun).' } },
  { id: 'v13', sk: 'action', s: 'Dad [ate] two slices of pie.', ask: 'What did Dad do?', h: 'Eat changes to a new word in the past. Find it.', ex: 'Ate is the past form of eat. It tells what Dad did.', notes: { slices: 'Slices are things.', two: 'Two tells how many.' } },
  { id: 'v14', sk: 'action', s: 'Our class [planted] seeds in the garden.', ask: 'What did our class do?', h: 'What did the class do with the seeds?', ex: 'Planted tells what the class did.', notes: { garden: 'Garden is a place.', seeds: 'Seeds are things.' } },

  // Standalone being / having / doing verbs
  { id: 'v15', sk: 'being', s: 'He [is] happy.', h: 'Which word tells about being? Happy describes him.', ex: 'Is tells about being. Happy describes him. Happy is not a verb.', notes: { happy: 'Happy describes him. It is not a verb.' } },
  { id: 'v16', sk: 'being', s: 'The ball [was] in the grass.', h: 'Nobody is doing an action. Which word tells about being?', ex: 'Was tells where the ball was being. It is the only verb.', notes: { grass: 'Grass is a thing.', in: 'In tells where.' } },
  { id: 'v17', sk: 'being', s: 'I [am] ready for the game.', h: 'Look for a BE family word.', ex: 'Am is a being verb. Ready describes me.', notes: { ready: 'Ready describes me. It is not a verb.' } },
  { id: 'v18', sk: 'being', s: 'The players [were] hungry after practice.', h: 'Look for a BE family word. Hungry describes the players.', ex: 'Were is the being verb. Hungry describes the players.', notes: { hungry: 'Hungry describes the players. It is not a verb.', practice: 'Here practice is a thing (after practice), so it is a noun in this sentence.' } },
  { id: 'v19', sk: 'being', s: 'My shoes [are] muddy.', h: 'Which word tells about being? Muddy describes the shoes.', ex: 'Are is the being verb. Muddy describes my shoes.', notes: { muddy: 'Muddy describes the shoes. It is not a verb.' } },
  { id: 'v20', sk: 'being', s: 'I [have] a glove.', h: 'Have can be the main verb all by itself.', ex: 'Have is the main verb here. No other verb comes with it.', notes: { glove: 'Glove is a thing.' } },
  { id: 'v21', sk: 'being', s: 'She [has] a new bat.', h: 'Is there a word that tells what she owns?', ex: 'Has is the main verb. It tells what she owns.', notes: { new: 'New describes the bat.' } },
  { id: 'v22', sk: 'being', s: 'We [had] pizza after the game.', h: 'Look for a HAVE family word.', ex: 'Had is the main verb here. It stands alone.', notes: { pizza: 'Pizza is a thing.', game: 'Game is a thing (an event).' } },
  { id: 'v23', sk: 'being', s: 'Grandma [does] the puzzle every Sunday.', h: 'Look for a DO family word. Is there another verb after it?', ex: 'Does is the main verb. It tells what Grandma does.', notes: { puzzle: 'Puzzle is a thing.', sunday: 'Sunday names a day. It is a noun.' } },
  { id: 'v24', sk: 'being', s: 'The kids [did] their homework.', h: 'Look for a DO family word. Is there another verb after it?', ex: 'Did is the main verb. It tells what the kids did.', notes: { homework: 'Homework is a thing.' } },

  // Two-word verb teams
  { id: 'v25', sk: 'team', s: 'The boy [was] [playing] yesterday.', ask: 'What was the boy doing?', h: 'Ask: What was the boy doing? Find every word in that answer.', ex: 'Was is the helper. Playing is the main verb. The whole verb team is was playing.', notes: { yesterday: 'Yesterday tells when. It is not a verb.' } },
  { id: 'v26', sk: 'team', s: 'We [are] [reading].', ask: 'What are we doing?', h: 'Ask: What are we doing?', ex: 'Are helps reading. The verb team is are reading.' },
  { id: 'v27', sk: 'team', s: 'She [has] [finished].', ask: 'What has she done?', h: 'Has can help another verb. Which verb does it help?', ex: 'Has helps finished. The verb team is has finished.' },
  { id: 'v28', sk: 'team', s: 'He [can] [swim].', ask: 'What can he do?', h: 'Can is a helper. What can he do?', ex: 'Can helps swim. The verb team is can swim.' },
  { id: 'v29', sk: 'team', s: 'They [will] [practice].', ask: 'What will they do?', h: 'Will is a helper. What will they do?', ex: 'Will helps practice. The verb team is will practice.' },
  { id: 'v30', sk: 'team', s: 'I [am] [packing] my bag.', ask: 'What am I doing?', h: 'Ask: What am I doing?', ex: 'Am helps packing. The verb team is am packing.', notes: { bag: 'Bag is a thing.' } },
  { id: 'v31', sk: 'team', s: 'The fans [were] [cheering] loudly.', ask: 'What were the fans doing?', h: 'Ask: What were the fans doing? Stop before the word that tells how.', ex: 'Were helps cheering. The verb team is were cheering.', notes: { loudly: 'Loudly tells HOW they cheered. It is an adverb, not a verb.' } },
  { id: 'v32', sk: 'team', s: 'Mia [is] [running] to second base.', ask: 'What is Mia doing?', h: 'Ask: What is Mia doing?', ex: 'Is helps running. The verb team is is running.', notes: { base: 'Base is a place.', second: 'Second tells which base.' } },
  { id: 'v33', sk: 'team', s: 'I [have] [packed] my bag.', ask: 'What have I done?', h: 'Here have helps another verb. Find both words.', ex: 'Have helps packed. The verb team is have packed.', notes: { bag: 'Bag is a thing.' } },
  { id: 'v34', sk: 'team', s: 'Dad [had] [cooked] the turkey before noon.', ask: 'What had Dad done?', h: 'Had is a helper here. What had Dad done?', ex: 'Had helps cooked. The verb team is had cooked.', notes: { turkey: 'Turkey is a thing.', noon: 'Noon tells a time. It is not a verb.' } },
  { id: 'v35', sk: 'team', s: 'You [should] [wear] your helmet.', ask: 'What should you do?', h: 'Should is a helper. What should you do?', ex: 'Should helps wear. The verb team is should wear.', notes: { helmet: 'Helmet is a thing.' } },
  { id: 'v36', sk: 'team', s: 'Our team [might] [win] today.', ask: 'What might our team do?', h: 'Might is a helper. What might the team do?', ex: 'Might helps win. The verb team is might win.', notes: { today: 'Today tells when. It is not a verb.', team: 'Team is a group of people (a noun).' } },
  { id: 'v37', sk: 'team', s: 'We [could] [hear] the crowd.', ask: 'What could we do?', h: 'Could is a helper. What could we do?', ex: 'Could helps hear. The verb team is could hear.', notes: { crowd: 'Crowd is a group of people (a noun).' } },
  { id: 'v38', sk: 'team', s: 'We [did] [finish] the puzzle!', ask: 'What did we do?', h: 'Did can help another verb. Look right after it.', ex: 'Did helps finish. The verb team is did finish.', notes: { puzzle: 'Puzzle is a thing.' } },
  { id: 'v39', sk: 'team', s: 'She [must] [stretch] before the race.', ask: 'What must she do?', h: 'Must is a helper. What must she do?', ex: 'Must helps stretch. The verb team is must stretch.', notes: { race: 'Race is a thing (an event).' } },
  { id: 'v40', sk: 'team', s: 'My cousin [would] [like] some pie.', ask: 'What would my cousin do?', h: 'Would is a helper. Which verb does it help?', ex: 'Would helps like. The verb team is would like.', notes: { pie: 'Pie is a thing.' } },
  { id: 'v41', sk: 'team', s: 'You [may] [borrow] my glove.', ask: 'What may you do?', h: 'May is a helper. What may you do?', ex: 'May helps borrow. The verb team is may borrow.', notes: { glove: 'Glove is a thing.' } },
  { id: 'v42', sk: 'team', s: 'The puppy [was] [sleeping] on the rug.', ask: 'What was the puppy doing?', h: 'Ask: What was the puppy doing?', ex: 'Was helps sleeping. The verb team is was sleeping.', notes: { rug: 'Rug is a thing.' } },
  { id: 'v43', sk: 'team', s: 'The coaches [have] [planned] a fun practice.', ask: 'What have the coaches done?', h: 'Have is a helper here. Which -ed word does it help?', ex: 'Have helps planned. The verb team is have planned. Practice is a thing here.', notes: { practice: 'Here practice is a thing (a fun practice), so it is a noun.', fun: 'Fun describes the practice.' } },

  // Three-word verb teams
  { id: 'v44', sk: 'long', s: 'He [has] [been] [practicing].', ask: 'What has he been doing?', h: 'This team has more than two verb words.', ex: 'Has and been are helpers. Practicing is the main verb. The team is has been practicing.' },
  { id: 'v45', sk: 'long', s: 'We [will] [be] [reading].', ask: 'What will we be doing?', h: 'Find two helpers and one main verb.', ex: 'Will and be are helpers. Reading is the main verb. The team is will be reading.' },
  { id: 'v46', sk: 'long', s: 'She [had] [been] [waiting] for the bus.', ask: 'What had she been doing?', h: 'Start at had. Keep going until you reach the main verb.', ex: 'Had and been help waiting. The team is had been waiting.', notes: { bus: 'Bus is a thing.' } },
  { id: 'v47', sk: 'long', s: 'The team [should] [have] [won].', ask: 'What should the team have done?', h: 'Won is the past form of win. Which helpers come before it?', ex: 'Should and have help won. The team is should have won.' },
  { id: 'v48', sk: 'long', s: 'I [will] [have] [finished] my book by Friday.', ask: 'What will I have done?', h: 'Find two helpers before the -ed main verb.', ex: 'Will and have help finished. The team is will have finished.', notes: { friday: 'Friday names a day. It is a noun.', book: 'Book is a thing.' } },
  { id: 'v49', sk: 'long', s: 'The players [have] [been] [running] laps.', ask: 'What have the players been doing?', h: 'There are two helpers before the main verb.', ex: 'Have and been help running. The team is have been running.', notes: { laps: 'Laps are things the players run.' } },

  // Ending clues
  { id: 'v50', sk: 'endings', s: 'The running shoes [are] red.', h: 'Careful! Does running tell what someone is doing here, or does it describe the shoes?', ex: 'Are is the verb. Running describes the shoes, so it is not a verb here.', notes: { running: 'Here running describes the shoes (running shoes). It is not a verb in this sentence.', red: 'Red describes the shoes.' } },
  { id: 'v51', sk: 'endings', s: 'The boy [is] [running].', ask: 'What is the boy doing?', h: 'Here running tells what the boy is doing. Does it have a helper?', ex: 'Is helps running. The verb team is is running.' },
  { id: 'v52', sk: 'endings', s: 'My painting [hangs] on the wall.', h: 'Painting has -ing, but read the sentence. What does the painting do?', ex: 'Hangs is the verb. Painting names a thing here.', notes: { painting: 'Here painting names a thing (my painting). The -ing ending does not make it a verb.', wall: 'Wall is a thing.' } },
  { id: 'v53', sk: 'endings', s: 'The singing bird [is] pretty.', h: 'Does singing describe the bird here? Find the being verb.', ex: 'Is is the verb. Singing describes which bird, and pretty describes the bird.', notes: { singing: 'Here singing describes the bird. It is not a verb in this sentence.', pretty: 'Pretty describes the bird.' } },
  { id: 'v54', sk: 'endings', s: 'Jada [jumped] over the rope.', ask: 'What did Jada do?', h: 'Look for an -ed ending. Does that word show what Jada did?', ex: 'Jumped tells what Jada did. The -ed ending shows the past.', notes: { rope: 'Rope is a thing.' } },

  // Challenge: words in between (optional)
  { id: 'v55', sk: 'challenge', s: 'The boy [is] not [sleeping].', ask: 'What is the boy not doing?', h: 'Not sits between the verb words. Leave not out.', ex: 'Is and sleeping are the verb words. Not is not a verb.', notes: { not: 'Not is NOT a verb. It changes the meaning, but leave it out of the verb team.' } },
  { id: 'v56', sk: 'challenge', s: 'She [can] easily [catch] the ball.', ask: 'What can she do?', h: 'A how word sneaks between the helper and the main verb. Skip it.', ex: 'Can and catch are the verb words. Easily tells how. It is not a verb.', notes: { easily: 'Easily tells HOW she catches. It is an adverb, not a verb.' } },
  { id: 'v57', sk: 'challenge', s: 'We [will] soon [eat] dinner.', ask: 'What will we do?', h: 'A when word sneaks into the verb team. Skip it.', ex: 'Will and eat are the verb words. Soon tells when.', notes: { soon: 'Soon tells WHEN. It is an adverb, not a verb.', dinner: 'Dinner is a thing.' } },
  { id: 'v58', sk: 'challenge', s: '[Can] you [hit] the ball?', ask: 'What can you do?', h: 'In a question, the helper can come first. Then find the main verb.', ex: 'Can and hit are the verb words. In a question, the helper moves to the front.', notes: { you: 'You is a pronoun. It names who. It is not a verb.' } },
  { id: 'v59', sk: 'challenge', s: 'They [are] not [playing] today.', ask: 'What are they not doing?', h: 'Find the helper and the main verb. Skip not.', ex: 'Are and playing are the verb words. Not and today are not verbs.', notes: { not: 'Not is NOT a verb. Leave it out of the verb team.', today: 'Today tells when.' } }
];

/* Helper-word memory questions (multiple choice) */
var HELPER_MC = [
  { id: 'h1', sk: 'helpers', q: 'Finish the BE family: am, is, are, was, ___', c: ['were', 'has', 'do'], a: 0, h: 'The BE family goes: am, is, are, was, ... then the plural past word.', ex: 'am, is, are, was, WERE, be, being, been.' },
  { id: 'h2', sk: 'helpers', q: 'Finish the HAVE family: have, has, ___', c: ['his', 'had', 'hat'], a: 1, h: 'Which word is the past of have?', ex: 'have, has, HAD. Only three words!' },
  { id: 'h3', sk: 'helpers', q: 'Finish the DO family: do, does, ___', c: ['dog', 'dot', 'did'], a: 2, h: 'Which one is the past of do?', ex: 'do, does, DID.' },
  { id: 'h4', sk: 'helpers', q: 'Which word is one of the 23 helping verbs?', c: ['shoe', 'should', 'shell'], a: 1, h: 'Think of the OTHER HELPERS: can, could, may, might, must, shall, ...', ex: 'Should is in the OTHER HELPERS group.' },
  { id: 'h5', sk: 'helpers', q: 'Which word is NOT one of the 23 helping verbs?', c: ['jump', 'will', 'been'], a: 0, h: 'Two of these are in the list. One is an action word.', ex: 'Jump is an action verb, but it is not one of the 23 helpers. Will and been are helpers.' },
  { id: 'h6', sk: 'helpers', q: 'Finish the chant: can, could, may, might, ___', c: ['make', 'must', 'more'], a: 1, h: 'It starts with m like may and might.', ex: 'can, could, may, might, MUST, shall, should, will, would.' },
  { id: 'h7', sk: 'helpers', q: 'Finish the chant: shall, should, will, ___', c: ['would', 'went', 'wall'], a: 0, h: 'It rhymes with could and should.', ex: 'shall, should, will, WOULD.' },
  { id: 'h8', sk: 'helpers', q: 'Finish the BE family: be, being, ___', c: ['bean', 'been', 'bee'], a: 1, h: 'It sounds like "bin" and ends the BE family.', ex: 'be, being, BEEN.' }
];

/* ───────────────────────── NOUN BANK ───────────────────────── */
var NOUN_BANK = [
  { id: 'n1', sk: 'multi', s: '[Chris:p] carries a [bat:t].', h: 'Find the person. Then find what he carries.', ex: 'Chris names a person. Bat names a thing.' },
  { id: 'n2', sk: 'multi', s: 'The [coach:p] stood on the [field:l].', h: 'Find who stood. Then find where.', ex: 'Coach names a person. Field names a place.' },
  { id: 'n3', sk: 'multi', s: 'My [sister:p] found a [shell:t] at the [beach:l].', h: 'There are three nouns: a person, a thing, and a place.', ex: 'Sister is a person. Shell is a thing. Beach is a place.' },
  { id: 'n4', sk: 'multi', s: '[Grandma:p] baked a [pie:t] in the [kitchen:l].', h: 'Who baked? What did she bake? Where?', ex: 'Grandma is a person. Pie is a thing. Kitchen is a place.' },
  { id: 'n5', sk: 'multi', s: 'The [players:p] ran to the [dugout:l].', h: 'Who ran? Where did they run?', ex: 'Players names people. Dugout names a place.' },
  { id: 'n6', sk: 'multi', s: '[Tasha:p] put her [glove:t] in her [bag:t].', h: 'One person and two things.', ex: 'Tasha is a person. Glove and bag are things.', notes: { her: 'Her tells whose. It is not a noun here.' } },
  { id: 'n7', sk: 'multi', s: 'Our [teacher:p] read a [book:t] to the [class:p].', h: 'Who read? What did she read? Who listened?', ex: 'Teacher is a person. Book is a thing. Class names a group of people.' },
  { id: 'n8', sk: 'things', s: 'The [cat:t] slept on the [bed:t].', h: 'Animals are nouns too. Find the animal and the thing it slept on.', ex: 'Cat names an animal, a living thing. Bed names a thing.' },
  { id: 'n9', sk: 'places', s: 'The [coach:p] stood on the [field:l].', want: 'l', h: 'Where did the coach stand?', ex: 'Field names a place. Coach is a noun too, but it names a person.' },
  { id: 'n10', sk: 'people', s: 'The [pitcher:p] threw the [ball:t].', want: 'p', h: 'Who threw the ball?', ex: 'Pitcher names a person. Ball is a thing.' },
  { id: 'n11', sk: 'things', s: 'My [uncle:p] fixed the [bike:t].', want: 't', h: 'What did my uncle fix?', ex: 'Bike names a thing. Uncle is a noun too, but he is a person.' },
  { id: 'n12', sk: 'places', s: 'We walked to the [library:l] with [Mom:p].', want: 'l', h: 'Where did we walk?', ex: 'Library names a place. Mom names a person.' },
  { id: 'n13', sk: 'people', s: 'The [farmer:p] fed the [cows:t].', want: 'p', h: 'Who fed the cows?', ex: 'Farmer names a person. Cows are animals.' },
  { id: 'n14', sk: 'places', s: 'The [kids:p] played in the [park:l].', want: 'l', h: 'Where did the kids play?', ex: 'Park names a place.' },
  { id: 'n15', sk: 'people', s: 'The [doctor:p] gave me a [sticker:t].', want: 'p', h: 'Who gave me something?', ex: 'Doctor names a person. Sticker is a thing.', notes: { me: 'Me is a pronoun. It stands in for a noun, so we do not tap it here.' } },
  { id: 'n16', sk: 'things', s: '[Dad:p] washed the [car:t].', want: 't', h: 'What did Dad wash?', ex: 'Car names a thing. Dad names a person.' },
  { id: 'n17', sk: 'proper', s: 'My [friend:p] [Marcus:pP] lives in [Atlanta:lP].', want: 'P', h: 'Proper nouns name a special person or place. Look for capital letters in the middle of the sentence.', ex: 'Marcus names a special person. Atlanta names a special city. Friend is a common noun.' },
  { id: 'n18', sk: 'proper', s: 'My [dog:t] [Rex:tP] can run fast.', want: 'P', h: 'What is the dog’s name?', ex: 'Rex is the name of one special dog, so it is a proper noun. Dog is a common noun.' },
  { id: 'n19', sk: 'proper', s: '[Jada:pP] fed her [puppy:t].', want: 'c', h: 'A common noun names any one, not a special name.', ex: 'Puppy is a common noun. Jada is a proper noun because it is her name.', notes: { her: 'Her tells whose. It is not a noun here.' } },
  { id: 'n20', sk: 'proper', s: 'We visited [Grandpa:pP] in [Georgia:lP] for [Thanksgiving:tP].', want: 'P', h: 'Look for three words that start with capital letters and are special names.', ex: 'Grandpa (used as his name), Georgia, and Thanksgiving are proper nouns.', notes: { we: 'We is a pronoun. It is not a proper noun.' } },
  { id: 'n21', sk: 'ideas', s: 'Her [kindness:i] helped the new [student:p].', want: 'i', h: 'Which noun is something you cannot touch?', ex: 'Kindness names an idea. You cannot touch it, but it is a noun. Student is a person.', notes: { her: 'Her tells whose kindness. It is not a noun here.' } },
  { id: 'n22', sk: 'ideas', s: 'We felt [joy:i] when our [team:p] won.', want: 'i', h: 'Which word names a feeling?', ex: 'Joy names a feeling, which is an idea. Team names a group of people.' },
  { id: 'n23', sk: 'ideas', s: 'The [team:p] showed [courage:i].', want: 'i', h: 'Which noun names something you cannot see or touch?', ex: 'Courage names an idea. Team names people.' },
  { id: 'n24', sk: 'multi', s: 'The [bird:t] sang in the [tree:t] by the [school:l].', h: 'Look for three nouns: an animal, a thing, and a place.', ex: 'Bird is an animal. Tree is a thing. School is a place.' }
];

/* ───────────────────────── ADJECTIVE BANK ───────────────────────── */
var ADJ_BANK = [
  { id: 'a1', sk: 'kind', s: 'The [red@ball] ball rolled.', h: 'Find the noun ball. What kind of ball?', ex: 'Red describes ball. It tells what kind.' },
  { id: 'a2', sk: 'kind', s: 'The [small@puppy] puppy sleeps.', h: 'What kind of puppy?', ex: 'Small describes puppy. It tells what kind.' },
  { id: 'a3', sk: 'many', s: '[Three@players] players ran.', h: 'How many players?', ex: 'Three describes players. It tells how many.' },
  { id: 'a4', sk: 'kind', s: 'The [brown@dog] dog barked.', h: 'What kind of dog?', ex: 'Brown describes dog.' },
  { id: 'a5', sk: 'kind', s: 'We ate [warm@bread] bread.', h: 'What kind of bread did we eat?', ex: 'Warm describes bread.' },
  { id: 'a6', sk: 'many', s: '[Five@birds] birds sat on the fence.', h: 'How many birds?', ex: 'Five describes birds. It tells how many.' },
  { id: 'a7', sk: 'kind', s: 'I wore my [blue@cap] cap.', h: 'What kind of cap?', ex: 'Blue describes cap.' },
  { id: 'a8', sk: 'kind', s: 'The [loud@crowd] crowd cheered.', h: 'What kind of crowd?', ex: 'Loud describes crowd.' },
  { id: 'a9', sk: 'many', s: '[Two@boys] boys played catch.', h: 'How many boys?', ex: 'Two describes boys. It tells how many.' },
  { id: 'a10', sk: 'kind', s: 'The [shiny@trophy] trophy sits on the shelf.', h: 'What kind of trophy?', ex: 'Shiny describes trophy.' },
  { id: 'a11', sk: 'kind', s: 'Grandma baked a [sweet@pie] pie.', h: 'What kind of pie?', ex: 'Sweet describes pie.' },
  { id: 'a12', sk: 'kind', s: 'The [happy@fans] fans clapped.', h: 'What kind of fans?', ex: 'Happy describes fans.' },
  { id: 'a13', sk: 'which', s: 'The [last@player] player ran home.', h: 'Which player ran home?', ex: 'Last describes player. It tells which one.' },
  { id: 'a14', sk: 'which', s: 'We will win the [next@game] game.', h: 'Which game will we win?', ex: 'Next describes game. It tells which one.' },
  { id: 'a15', sk: 'multi', s: 'The [little@kitten] kitten has [green@eyes] eyes.', h: 'There are two nouns: kitten and eyes. Each one has a describing word.', ex: 'Little describes kitten. Green describes eyes.' },
  { id: 'a16', sk: 'multi', s: 'The [old@tree] tree has [many@leaves] leaves.', h: 'What kind of tree? How many leaves?', ex: 'Old describes tree (what kind). Many describes leaves (how many).' },
  { id: 'a17', sk: 'multi', s: '[Six@ducks] ducks swam in the [cold@pond] pond.', h: 'How many ducks? What kind of pond?', ex: 'Six describes ducks. Cold describes pond.' },
  { id: 'a18', sk: 'link', s: 'The [muddy@shoes] shoes are by the door.', h: 'Find the noun shoes. What kind of shoes?', ex: 'Muddy describes shoes.' },
  { id: 'a19', sk: 'link', s: 'My [new@bat] bat is [heavy@bat].', h: 'Both describing words tell about the bat. One comes after is.', ex: 'New and heavy both describe bat. An adjective can come after a being verb.' },
  { id: 'a20', sk: 'link', s: 'We laughed at the [funny@movie] movie.', h: 'What kind of movie?', ex: 'Funny describes movie.' },
  { id: 'a21', sk: 'link', s: 'The [tired@players] players rested.', h: 'What kind of players? (This describing word ends in -ed!)', ex: 'Tired describes players. Not every -ed word is a verb.' },
  { id: 'a22', sk: 'link', s: 'A [big@bus] bus stopped at the corner.', h: 'What kind of bus?', ex: 'Big describes bus.' }
];

/* ───────────────────────── ADVERB BANK ───────────────────────── */
var ADV_BANK = [
  { id: 'd1', sk: 'how', s: 'Chris runs [quickly@runs:how].', h: 'How does Chris run?', ex: 'Quickly tells HOW Chris runs.' },
  { id: 'd2', sk: 'how', s: 'The turtle moved [slowly@moved:how].', h: 'How did the turtle move?', ex: 'Slowly tells HOW the turtle moved.' },
  { id: 'd3', sk: 'how', s: 'She sang [loudly@sang:how].', h: 'How did she sing?', ex: 'Loudly tells HOW she sang.' },
  { id: 'd4', sk: 'how', s: 'He threw the ball [carefully@threw:how].', h: 'How did he throw?', ex: 'Carefully tells HOW he threw.' },
  { id: 'd5', sk: 'how', s: 'The team played [well@played:how].', h: 'How did the team play? (Not every adverb ends in -ly.)', ex: 'Well tells HOW the team played. It does not end in -ly, but it is an adverb.' },
  { id: 'd6', sk: 'how', s: 'Grandpa drove [fast@drove:how].', h: 'How did Grandpa drive?', ex: 'Fast tells HOW Grandpa drove.' },
  { id: 'd7', sk: 'when', s: 'We practiced [yesterday@practiced:when].', h: 'When did we practice?', ex: 'Yesterday tells WHEN we practiced.' },
  { id: 'd8', sk: 'when', s: '[Today@play:when] we play [outside@play:where].', want: 'when', h: 'Which word tells WHEN we play?', ex: 'Today tells WHEN. Outside is an adverb too, but it tells WHERE.' },
  { id: 'd9', sk: 'when', s: 'The bus will come [soon@come:when].', h: 'When will the bus come?', ex: 'Soon tells WHEN the bus will come.' },
  { id: 'd10', sk: 'when', s: 'I will clean my room [later@clean:when].', h: 'When will I clean?', ex: 'Later tells WHEN I will clean.' },
  { id: 'd11', sk: 'when', s: 'We will eat pie [tonight@eat:when].', h: 'When will we eat pie?', ex: 'Tonight tells WHEN we will eat.' },
  { id: 'd12', sk: 'when', s: 'I finished my snack [first@finished:when].', h: 'When did I finish? Before or after?', ex: 'First tells WHEN I finished.' },
  { id: 'd13', sk: 'where', s: 'The children played [outside@played:where].', h: 'Where did the children play?', ex: 'Outside tells WHERE the children played.' },
  { id: 'd14', sk: 'where', s: 'Please come [here@come:where].', h: 'Where should you come?', ex: 'Here tells WHERE to come.' },
  { id: 'd15', sk: 'where', s: 'The cat ran [upstairs@ran:where].', h: 'Where did the cat run?', ex: 'Upstairs tells WHERE the cat ran.' },
  { id: 'd16', sk: 'where', s: 'The kite flew [away@flew:where].', h: 'Where did the kite fly?', ex: 'Away tells WHERE the kite flew.' },
  { id: 'd17', sk: 'where', s: 'We looked [everywhere@looked:where] for the glove.', h: 'Where did we look?', ex: 'Everywhere tells WHERE we looked.' },
  { id: 'd18', sk: 'where', s: 'The ball rolled [inside@rolled:where].', h: 'Where did the ball roll?', ex: 'Inside tells WHERE the ball rolled.' },
  { id: 'd19', sk: 'compare', s: 'The player throws [carefully@throws:how].', h: 'Which word tells how the player throws?', ex: 'Carefully describes throws, a verb. So carefully is an adverb.' },
  { id: 'd20', sk: 'compare', s: 'The quiet girl spoke [quietly@spoke:how].', h: 'One word describes the girl. One word describes how she spoke. Which tells HOW?', ex: 'Quietly tells how she spoke, so it is an adverb. Quiet describes the girl, so it is an adjective.', notes: { quiet: 'Quiet describes the girl, a noun. That makes it an adjective, not an adverb.' } },
  { id: 'd21', sk: 'compare', k: 'mc', q: 'The careful player throws.\nWhat does careful describe?', c: ['player — so careful is an adjective', 'throws — so careful is an adverb'], a: 0, h: 'Ask: careful what? Is it a careful player, or does it tell how he throws?', ex: 'Careful describes the player, a noun. So careful is an adjective.' },
  { id: 'd22', sk: 'compare', k: 'mc', q: 'The friendly dog wagged its tail.\nFriendly ends in -ly. What is it?', c: ['an adverb, because it ends in -ly', 'an adjective, because it describes the dog'], a: 1, why: ['The -ly ending is only a clue. Ask what friendly describes.'], h: 'Ask: friendly what?', ex: 'Friendly describes the dog, a noun. So it is an adjective, even though it ends in -ly.' },
  { id: 'd23', sk: 'compare', k: 'mc', q: 'Chris runs fast.\nWhat does fast describe?', c: ['runs — so fast is an adverb', 'Chris — so fast is an adjective'], a: 0, h: 'Does fast tell how Chris runs?', ex: 'Fast tells how Chris runs. It describes the verb runs, so it is an adverb.' }
];

/* ───────────────────────── VOWEL BANK ───────────────────────── */
var VOWEL_BANK = [
  { id: 'o1', sk: 'short', k: 'mc', q: 'Which word has a short a sound, like in cat?', c: ['cap', 'cape', 'rain'], a: 0, say: true, h: 'Look for one vowel between two consonants, like c-a-t.', ex: 'Cap has one vowel between two consonants (c-a-p). That pattern usually makes a short vowel.', why: [null, 'Cape ends with silent e. The a says its name: long a.', 'Rain has the vowel team ai, which says long a.'] },
  { id: 'o2', sk: 'silente', k: 'mc', q: 'Which word follows the silent-e pattern?', c: ['big', 'bike', 'bag'], a: 1, say: true, h: 'Look for a word that ends in e after one consonant.', ex: 'Bike follows vowel + consonant + e. The e is silent and the i says its name.' },
  { id: 'o3', sk: 'silente', k: 'mc', q: 'Add a silent e to the end of kit. What word do you make?', c: ['kits', 'kite', 'kitten'], a: 1, say: true, h: 'Write kit, then put an e at the end.', ex: 'kit + e = kite. The silent e helps the i say its name.' },
  { id: 'o4', sk: 'silente', k: 'mc', q: 'In the word hope, what sound does the o usually make?', c: ['long o — it says its name', 'short o — like in hop'], a: 0, say: true, h: 'Hope ends with a silent e. What does silent e often do to the vowel before it?', ex: 'In hope, silent e helps the o say its name: long o.' },
  { id: 'o5', sk: 'teams', k: 'mc', q: 'Which word has the vowel team ai?', c: ['ran', 'ring', 'rain'], a: 2, say: true, h: 'Look for the letters a and i side by side.', ex: 'Rain has a and i together. The team ai often says long a.' },
  { id: 'o6', sk: 'teams', k: 'mc', q: 'Which word has the vowel team ee?', c: ['feet', 'fed', 'fit'], a: 0, say: true, h: 'Look for two e letters side by side.', ex: 'Feet has ee. The team ee says long e.' },
  { id: 'o7', sk: 'teams', k: 'mc', q: 'Which word has the vowel team ea?', c: ['ten', 'tame', 'team'], a: 2, say: true, h: 'Look for the letters e and a side by side.', ex: 'Team has ea. Tame has a silent e, which is a different pattern.', why: ['Ten has only one vowel letter.', 'Tame has a silent e at the end, not the team ea.'] },
  { id: 'o8', sk: 'teams', k: 'mc', q: 'Which word has the vowel team oa?', c: ['bone', 'boat', 'bat'], a: 1, say: true, h: 'Look for o and a side by side.', ex: 'Boat has oa. Bone also has a long o, but it uses silent e instead.', why: ['Bone has long o too, but it is spelled with silent e, not oa.'] },
  { id: 'o9', sk: 'silente', k: 'sort', q: 'Sort each word by its spelling pattern.', b: ['Short vowel (no silent e)', 'Long vowel (silent e)'], items: [['cap', 0], ['cape', 1], ['hop', 0], ['hope', 1], ['kit', 0], ['kite', 1]], h: 'Does the word end with a silent e? If yes, the vowel usually says its name.', ex: 'cap, hop, kit have short vowels. cape, hope, kite end with silent e and have long vowels.' },
  { id: 'o10', sk: 'teams', k: 'sort', q: 'Sort each word by its vowel team.', b: ['ai', 'oa'], items: [['rain', 0], ['boat', 1], ['tail', 0], ['coat', 1], ['paint', 0], ['road', 1]], h: 'Look at the two vowel letters in the middle of each word.', ex: 'rain, tail, paint have ai. boat, coat, road have oa.' },
  { id: 'o11', sk: 'teams', k: 'sort', q: 'Sort each word by its vowel team.', b: ['ee', 'ea'], items: [['feet', 0], ['team', 1], ['seed', 0], ['seat', 1], ['tree', 0], ['beach', 1]], h: 'Is it two e letters, or e then a?', ex: 'feet, seed, tree have ee. team, seat, beach have ea. Both teams say long e here.' },
  { id: 'o12', sk: 'short', k: 'mc', q: 'Which word has a short u sound, like in cup?', c: ['tube', 'tub', 'cute'], a: 1, say: true, h: 'Look for a word with no silent e and one vowel between consonants.', ex: 'Tub has the short u pattern t-u-b. Tube and cute end with silent e.' },
  { id: 'o13', sk: 'long', k: 'mc', q: 'Which word has a long u, like in cute?', c: ['tube', 'tub', 'cut'], a: 0, say: true, h: 'Which word ends with a silent e?', ex: 'Tube ends with silent e, so the u says its name.' },
  { id: 'o14', sk: 'silente', k: 'mc', q: 'cap → cape. What changed when we added e?', c: ['The a now says its name (long a).', 'The a now says a short sound.', 'The word lost a vowel.'], a: 0, say: true, h: 'Silent e often helps the vowel before it say its name.', ex: 'In cape, the silent e helps the a say its name: long a.' },
  { id: 'o15', sk: 'silente', k: 'mc', q: 'Which pair shows short vowel → long vowel with silent e?', c: ['hop → hope', 'hop → hip', 'hope → home'], a: 0, h: 'Look for a pair where the only change is an e added at the end.', ex: 'hop + e = hope. The o changes from short to long.' },
  { id: 'o16', sk: 'letters', k: 'mc', q: 'How many vowel letters are in the word tent?', c: ['1', '2', '3'], a: 0, h: 'The vowel letters are a, e, i, o, u. Check each letter in t-e-n-t.', ex: 'Tent has one vowel letter: e.' },
  { id: 'o17', sk: 'short', k: 'mc', q: 'Which word has a short i sound, like in pig?', c: ['fine', 'bike', 'fin'], a: 2, say: true, h: 'Find the word with no silent e.', ex: 'Fin has the short i pattern f-i-n. Fine and bike end with silent e.' },
  { id: 'o18', sk: 'short', k: 'mc', q: 'Which word has a short o sound, like in dog?', c: ['hot', 'hope', 'boat'], a: 0, say: true, h: 'Find the word with one vowel between two consonants.', ex: 'Hot has the short o pattern h-o-t.' },
  { id: 'o19', sk: 'short', k: 'mc', q: 'Which word has a short e sound, like in bed?', c: ['feet', 'these', 'pet'], a: 2, say: true, h: 'Find the word with one e between two consonants.', ex: 'Pet has the short e pattern p-e-t. Feet has ee and these has silent e: both long e.' },
  { id: 'o20', sk: 'teams', k: 'mc', q: 'Which word fits and has the vowel team ai?\n“We waited for the ___ to stop.”', c: ['ran', 'run', 'rain'], a: 2, h: 'Which word makes sense AND has a and i together?', ex: 'Rain makes sense and has the ai team.' },
  { id: 'o21', sk: 'teams', k: 'mc', q: 'Which word has a vowel team that says long o?', c: ['rod', 'road', 'rid'], a: 1, say: true, h: 'Look for o and a side by side.', ex: 'Road has the team oa, which says long o.' },
  { id: 'o22', sk: 'long', k: 'mc', q: 'Which word has long a spelled with a silent e?', c: ['rain', 'cap', 'cake'], a: 2, say: true, h: 'Two words may have long a, but only one uses silent e.', ex: 'Cake uses silent e. Rain has long a too, but it uses the team ai.', why: ['Rain has long a, but it is spelled with ai, not silent e.', 'Cap has a short a.'] },
  { id: 'o23', sk: 'letters', k: 'mc', q: 'Which letter in the word cup is a vowel?', c: ['c', 'u', 'p'], a: 1, h: 'The vowel letters are a, e, i, o, u.', ex: 'U is a vowel letter.' },
  { id: 'o24', sk: 'long', k: 'sort', q: 'Sort each word: short vowel or long vowel?', b: ['Short vowel', 'Long vowel'], items: [['bed', 0], ['seed', 1], ['pig', 0], ['kite', 1], ['cup', 0], ['cute', 1]], h: 'Long vowels in these words use silent e or a vowel team.', ex: 'bed, pig, cup are short (one vowel between consonants). seed (ee), kite (silent e), cute (silent e) are long.' }
];

/* ───────────────────────── READING PASSAGES (6) ───────────────────────── */
var PASSAGES = [
  {
    id: 'p1', title: 'Teamwork on the Baseball Field', type: 'Nonfiction', topic: 'Baseball teamwork',
    paras: [
      ['A baseball team has nine players on the field.', 'Each player has a job.', 'The pitcher throws the ball to the batter.', 'The catcher squats behind home plate and catches the pitches.', 'Other players stand in the field to stop the ball.'],
      ['Players must help each other.', 'When a ball is hit far, one player may throw it to another player who is closer to the base.', 'This is called a relay.', 'A relay gets the ball there faster than one long throw.'],
      ['Players also talk to each other.', 'If two players run for the same ball, one calls, “I got it!”', 'Then the other player moves out of the way.', 'That keeps them from crashing.'],
      ['A team wins more games when every player does a job and helps the others.']
    ],
    qs: [
      { id: 'p1q1', sk: 'main', q: 'What is this passage mostly about?', c: ['How baseball players work together as a team', 'How to throw a fast pitch', 'Why the catcher wears a mask', 'How to buy a baseball glove'], a: 0, h: 'Read the first sentence of each paragraph and the last sentence. What do they all talk about?', ex: 'Every part tells how players do jobs, help, and talk to each other. The last sentence says it too.', why: [null, 'The passage says the pitcher throws, but it never tells how to throw fast.', 'A mask is never mentioned in the passage.', 'Buying a glove is never mentioned.'] },
      { id: 'p1q2', sk: 'detail', q: 'What does the catcher do?', c: ['Stands far away in the field', 'Squats behind home plate and catches pitches', 'Throws the ball to the batter', 'Calls the game on the radio'], a: 1, h: 'Find the word catcher in the first paragraph.', ex: 'The passage says: “The catcher squats behind home plate and catches the pitches.”', why: ['That is what the other players in the field do.', null, 'That is the pitcher’s job.', 'The passage does not say that.'] },
      { id: 'p1q3', sk: 'vocab', q: 'What does the word relay mean in this passage?', c: ['A kind of baseball bat', 'A long, slow walk', 'Passing the ball from one player to another to get it there faster', 'A cheer the fans yell'], a: 2, h: 'Read the sentence before “This is called a relay” and the sentence after it.', ex: 'The passage says one player throws to another player who is closer, and a relay gets the ball there faster.' },
      { id: 'p1q4', sk: 'evidence', k: 'ev', q: 'Tap the sentence that shows how players talk to stay safe.', ok: [10, 12], h: 'Look in the paragraph that starts “Players also talk to each other.”', ex: 'One player calls “I got it!” and that keeps them from crashing. Both sentences show talking keeps players safe.' },
      { id: 'p1q5', sk: 'sequence', q: 'What happens right after one player calls “I got it!”?', c: ['The game ends.', 'The other player moves out of the way.', 'The pitcher throws a new ball.', 'Both players crash.'], a: 1, h: 'Find “I got it!” Then read the very next sentence.', ex: 'The next sentence says: “Then the other player moves out of the way.”', why: [null, null, null, 'The passage says calling out keeps them FROM crashing.'] }
    ]
  },
  {
    id: 'p2', title: 'The Thanksgiving Puzzle', type: 'Fiction', topic: 'A family Thanksgiving activity',
    paras: [
      ['On Thanksgiving morning, the house smelled like sweet potato pie.', 'Grandma Jean poured a big box of puzzle pieces onto the table.', '“Let’s build this before dinner,” she said.'],
      ['Malik and his cousin Ava looked at the picture on the box.', 'It showed a red barn and a field of orange pumpkins.', 'First, they found all the edge pieces.', 'Next, Ava sorted the pumpkin pieces into a pile.', 'Malik worked on the barn.'],
      ['The puzzle took a long time.', 'Malik felt frustrated when a piece would not fit.', 'Ava said, “Turn it around and try again.”', 'He turned it, and it clicked into place!'],
      ['At last, Grandma Jean pressed in the final piece.', 'Everyone cheered.', '“We finished it together,” Malik said with a grin.']
    ],
    qs: [
      { id: 'p2q1', sk: 'sequence', q: 'What did Malik and Ava do FIRST to build the puzzle?', c: ['They worked on the barn.', 'They found all the edge pieces.', 'They pressed in the final piece.', 'They sorted the pumpkin pieces.'], a: 1, h: 'Look for the signal word First in the second paragraph.', ex: 'The story says: “First, they found all the edge pieces.”', why: ['Malik worked on the barn after they found the edges.', null, 'That happened at the very end.', 'That came Next, not first.'] },
      { id: 'p2q2', sk: 'vocab', q: 'What does frustrated mean in this story?', c: ['Very sleepy', 'Upset because something is hard', 'Hungry for pie', 'Excited to win'], a: 1, h: 'Read the whole sentence: a piece would not fit. How would that feel?', ex: 'Malik felt frustrated when a piece would not fit. That means upset because something was hard.' },
      { id: 'p2q3', sk: 'inference', q: 'How did Malik most likely feel when the piece clicked into place?', c: ['Glad that it finally fit', 'Angry at Ava', 'Bored with the puzzle', 'Scared of the barn'], a: 0, h: 'Use a clue from the story (the ! mark and “clicked into place”) and what you know about fixing a hard problem.', ex: 'The piece finally fit after he was frustrated. The exclamation mark is a clue. Most people feel glad when a hard part finally works.', why: [null, 'Ava helped him. Nothing in the story shows he was angry at her.', 'He kept working and cheered at the end, so he was not bored.', 'Nothing in the story shows he was scared.'] },
      { id: 'p2q4', sk: 'evidence', k: 'ev', q: 'Tap the sentence that shows Ava helped Malik.', ok: [10], h: 'Look for something Ava SAID when Malik was stuck.', ex: 'Ava said, “Turn it around and try again.” That advice helped Malik make the piece fit.' },
      { id: 'p2q5', sk: 'main', q: 'What is this story mostly about?', c: ['How to bake sweet potato pie', 'A family working together to finish a puzzle', 'A red barn on a farm', 'Why Malik does not like puzzles'], a: 1, h: 'What do the characters do from the beginning to the end?', ex: 'The family starts, works on, and finishes a puzzle together. Malik even says, “We finished it together.”', why: ['The pie is only mentioned in the first sentence.', null, 'The barn is only in the puzzle picture.', 'Malik grins at the end, so he did not dislike it.'] }
    ]
  },
  {
    id: 'p3', title: 'A New Kid at Recess', type: 'Fiction', topic: 'Helping a friend',
    paras: [
      ['Deshawn saw a new boy standing alone by the fence at recess.', 'The boy held a soccer ball, but he did not kick it.', 'He kept looking down at the ground.'],
      ['Deshawn remembered his own first day at a new school.', 'He had felt lonely too.', 'So he walked over and said, “Hi, I’m Deshawn. Do you want to play?”'],
      ['The boy looked up.', '“I’m Omar,” he said softly.', '“I don’t know anyone here.”'],
      ['“Now you know me,” Deshawn said.', 'He waved to his friends Lila and Ben.', 'Soon the four of them were passing the ball across the grass.'],
      ['When the bell rang, Omar was smiling.', '“Can we play again tomorrow?” he asked.', 'Deshawn nodded and said, “Every day.”']
    ],
    qs: [
      { id: 'p3q1', sk: 'inference', q: 'How did Omar most likely feel at the start of recess?', c: ['Lonely and shy', 'Angry and loud', 'Silly and playful', 'Tired and sleepy'], a: 0, h: 'Clues: Omar stood alone and kept looking down. What do you know about how that looks?', ex: 'Omar stood alone, looked at the ground, and said he did not know anyone. Those clues show he felt lonely and shy.' },
      { id: 'p3q2', sk: 'evidence', k: 'ev', q: 'Tap a sentence that is a clue that Omar felt alone.', ok: [0, 2, 8], h: 'Look at what Omar did or said at the beginning, before he played.', ex: 'Good clues: he stood alone by the fence, he kept looking down, and he said, “I don’t know anyone here.”' },
      { id: 'p3q3', sk: 'detail', q: 'Why did Deshawn walk over to Omar?', c: ['He wanted Omar’s soccer ball.', 'The teacher told him to.', 'He remembered feeling lonely on his own first day.', 'He wanted to go inside.'], a: 2, h: 'Read the second paragraph. What did Deshawn remember?', ex: 'The story says Deshawn remembered his first day at a new school and that he had felt lonely too.', why: ['The story never says he wanted the ball.', 'No teacher is in the story.', null, 'He stayed outside to play.'] },
      { id: 'p3q4', sk: 'sequence', q: 'What happened right after Deshawn waved to Lila and Ben?', c: ['The bell rang.', 'Omar said his name.', 'The four of them passed the ball across the grass.', 'Deshawn saw Omar by the fence.'], a: 2, h: 'Find the sentence about waving. Read the next sentence.', ex: 'The next sentence says: “Soon the four of them were passing the ball across the grass.”' },
      { id: 'p3q5', sk: 'main', q: 'What lesson does this story show?', c: ['Soccer is better than baseball.', 'Being kind can help someone feel welcome.', 'Recess should be longer.', 'New kids should stay by the fence.'], a: 1, h: 'How did Omar change from the beginning to the end? What caused it?', ex: 'Omar started alone and ended up smiling because Deshawn was kind. Kindness helped him feel welcome.' }
    ]
  },
  {
    id: 'p4', title: 'Where Is the Glove?', type: 'Fiction', topic: 'Solving a small problem',
    paras: [
      ['Jordan had a game at four o’clock.', 'At three, he could not find his baseball glove.', 'He looked under his bed, but it was not there.', 'He looked in his closet, but it was not there either.'],
      ['Jordan took a deep breath.', '“Think,” he told himself. “Where did I use it last?”', 'He remembered playing catch with his dad on Sunday.', 'After that, they had sat on the back porch and eaten apples.'],
      ['Jordan ran outside to the porch.', 'There was his glove, sitting under the bench!', 'It was a little damp from the morning dew, so he dried it with a towel.'],
      ['He made it to the game on time.', 'After that day, Jordan always put his glove in his bag right after he used it.']
    ],
    qs: [
      { id: 'p4q1', sk: 'main', q: 'What problem did Jordan have?', c: ['He was late for school.', 'He could not find his baseball glove.', 'He did not like apples.', 'His dad was sick.'], a: 1, h: 'Read the first paragraph. What was Jordan looking for?', ex: 'At three o’clock, Jordan could not find his glove, and he had a game at four.' },
      { id: 'p4q2', sk: 'sequence', q: 'What did Jordan do right after he took a deep breath?', c: ['He looked under his bed.', 'He thought about where he used the glove last.', 'He dried the glove with a towel.', 'He went to the game.'], a: 1, h: 'Find “Jordan took a deep breath.” Read the next sentence.', ex: 'Right after the deep breath, Jordan said, “Think. Where did I use it last?”', why: ['He looked under the bed BEFORE the deep breath.', null, 'He dried it later, after he found it.', 'The game was at the end.'] },
      { id: 'p4q3', sk: 'vocab', q: 'What does damp mean in this story?', c: ['Broken', 'A little wet', 'Very hot', 'Brand new'], a: 1, h: 'Clues: morning dew, and he dried it with a towel.', ex: 'Dew is water, and he dried the glove with a towel. So damp means a little wet.' },
      { id: 'p4q4', sk: 'evidence', k: 'ev', q: 'Tap the sentence that proves Jordan found his glove.', ok: [9], h: 'Look in the paragraph where Jordan runs to the porch.', ex: '“There was his glove, sitting under the bench!” proves he found it.' },
      { id: 'p4q5', sk: 'inference', q: 'Why did Jordan start putting his glove in his bag right after using it?', c: ['So he would not lose it again', 'Because the bag was new', 'Because his dad was angry', 'So the glove would get wet'], a: 0, h: 'Think about the problem he just had. What would stop it from happening again?', ex: 'Jordan almost could not find his glove. Putting it in his bag every time helps him not lose it again.' }
    ]
  },
  {
    id: 'p5', title: 'How Squirrels Get Ready for Winter', type: 'Nonfiction', topic: 'Animals and nature',
    paras: [
      ['In the fall, you might see squirrels running back and forth across a yard.', 'They are busy getting ready for winter.'],
      ['Gray squirrels gather nuts and seeds.', 'They dig small holes and bury the food in many different places.', 'Hiding food to eat later is called caching.', 'One squirrel can hide thousands of nuts in a single fall!'],
      ['How do squirrels find the food later?', 'They have a strong sense of smell.', 'They also remember where many of their hiding spots are.', 'Even so, they do not find every nut.', 'Some forgotten nuts grow into new trees.'],
      ['Squirrels also build nests out of leaves and twigs high in the trees.', 'The nests keep them warm and dry on cold days.']
    ],
    qs: [
      { id: 'p5q1', sk: 'main', q: 'What is this passage mostly about?', c: ['How squirrels get ready for winter', 'How to plant a tree', 'Why leaves change color', 'How birds build nests'], a: 0, h: 'Look at the title and the second sentence.', ex: 'The passage tells how squirrels hide food and build nests to get ready for winter.' },
      { id: 'p5q2', sk: 'vocab', q: 'What does caching mean in this passage?', c: ['Catching a ball', 'Hiding food to eat later', 'Climbing a tree', 'Sleeping all winter'], a: 1, h: 'The passage tells you the meaning in the same sentence.', ex: 'The passage says: “Hiding food to eat later is called caching.”' },
      { id: 'p5q3', sk: 'detail', q: 'What helps squirrels find their hidden food?', c: ['A map', 'Other animals', 'A strong sense of smell', 'Bright lights'], a: 2, h: 'Read the third paragraph.', ex: 'The passage says squirrels have a strong sense of smell, and they remember many hiding spots.' },
      { id: 'p5q4', sk: 'evidence', k: 'ev', q: 'Tap the sentence that shows squirrels can help new trees grow.', ok: [10], h: 'Look for the word trees in the third paragraph.', ex: '“Some forgotten nuts grow into new trees.” shows squirrels help trees grow by burying nuts.' },
      { id: 'p5q5', sk: 'inference', q: 'Why do squirrels hide food in the fall?', c: ['So they have food in winter, when food is hard to find', 'Because they do not like nuts', 'To make the yard look nice', 'So birds can eat it'], a: 0, h: 'Clue: they are getting ready for winter. What do you know about plants and food in winter?', ex: 'The passage says they are getting ready for winter. In winter, fewer plants grow, so stored food helps them eat.' }
    ]
  },
  {
    id: 'p6', title: 'Too Fast', type: 'Fiction', topic: 'Learning from a mistake',
    paras: [
      ['Kendra loved being the first to finish.', 'On Monday, her teacher handed out a spelling test.', 'Kendra wrote fast.', 'She was done in two minutes and put her pencil down with a smile.'],
      ['On Wednesday, she got her test back.', 'There were five red marks on it.', 'She had written “wen” instead of “when” and “frend” instead of “friend.”', 'Kendra knew those words!', 'She had just rushed.'],
      ['At home, Kendra told her mom, “I went too fast.”', 'Mom nodded and asked, “What could you do next time?”', 'Kendra thought about it.', '“I can check each word before I turn it in,” she said.'],
      ['The next Monday, Kendra took her time.', 'She read every word twice.', 'When she got her test back, it had a big gold star.']
    ],
    qs: [
      { id: 'p6q1', sk: 'sequence', q: 'Which of these happened FIRST?', c: ['Kendra got a gold star.', 'Kendra wrote her test fast.', 'Kendra told her mom.', 'Kendra read every word twice.'], a: 1, h: 'Look at the first paragraph. What happened on the first Monday?', ex: 'On the first Monday, Kendra wrote fast. The other events happened later.' },
      { id: 'p6q2', sk: 'inference', q: 'How did Kendra most likely feel when she saw the five red marks?', c: ['Proud', 'Disappointed', 'Sleepy', 'Hungry'], a: 1, h: 'Clue: “Kendra knew those words!” How do you feel when you miss something you know?', ex: 'She knew the words but still got them wrong. Most people feel disappointed when that happens.' },
      { id: 'p6q3', sk: 'vocab', q: 'What does rushed mean in this story?', c: ['Went too fast without being careful', 'Ran outside', 'Took a long nap', 'Spelled every word right'], a: 0, h: 'Kendra wrote fast and made mistakes on words she knew.', ex: 'Rushed means she went too fast and was not careful.' },
      { id: 'p6q4', sk: 'evidence', k: 'ev', q: 'Tap a sentence that shows Kendra changed what she did.', ok: [13, 14], h: 'Look in the last paragraph, on the next Monday.', ex: 'She took her time and read every word twice. Those sentences show the change.' },
      { id: 'p6q5', sk: 'main', q: 'What did Kendra learn?', c: ['Spelling tests are too hard.', 'Checking your work carefully is better than finishing first.', 'Gold stars are shiny.', 'Mom is a good speller.'], a: 1, h: 'What did Kendra do differently, and what happened?', ex: 'Kendra slowed down and checked each word, and she got a gold star. Being careful mattered more than being first.' }
    ]
  }
];

/* ───────────────────────── LESSONS ───────────────────────── */
/* Step types: explain, show, compare, words, table, cards, guided, try, mc, reading */
var LESSONS = {
  verbs: [
    { id: 'A', title: 'Action Verbs', skill: 'action', key: 'A verb can tell what someone or something does.', steps: [
      { t: 'explain', title: 'Action verbs', text: ['A verb can tell what someone or something does.', 'Some actions you can see, like run and throw.', 'Some actions happen in your head, like think and learn.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'Chris [swings] the bat.', labels: { swings: 'verb' }, text: ['Swings tells what Chris does.', 'We draw TWO lines under a verb.'] },
      { t: 'words', title: 'Action words to know', groups: [ { name: 'Body actions', words: ['run', 'jump', 'throw', 'catch', 'swing'] }, { name: 'Word actions', words: ['read', 'write', 'talk'] }, { name: 'Thinking actions', words: ['think', 'know', 'learn'] } ], text: ['Act out one body action.', 'Thinking actions happen in your brain. They are verbs too!'] },
      { t: 'guided', coach: 'What does the dog do? Tap that word.', q: { mode: 'verb', s: 'The dog [runs] outside.', ask: 'What does the dog do?', h: 'The dog is doing something. Which word tells what it does?', ex: 'Runs tells what the dog does. Runs is the verb.', notes: { outside: 'Outside tells WHERE the dog runs. It is not a verb.', dog: 'Dog names an animal. Which word tells what it DOES?' } } },
      { t: 'try', q: { mode: 'verb', s: 'Mom [cooks] dinner.', ask: 'What does Mom do?', h: 'Dinner is the food. Which word is the action?', ex: 'Cooks tells what Mom does.', notes: { dinner: 'Dinner is a thing (a noun). What does Mom DO?' } } },
      { t: 'try', q: { mode: 'verb', s: 'I [think] about baseball.', ask: 'What do I do?', h: 'This action happens in your head.', ex: 'Think is a thinking action. It is a verb.', notes: { baseball: 'Baseball is a thing (a game). Find the action.' } } }
    ] },
    { id: 'B', title: 'Being Verbs', skill: 'being', key: 'Some verbs tell about being: am, is, are, was, were.', steps: [
      { t: 'explain', title: 'Being verbs', text: ['Some verbs tell about being.', 'They do not show an action you can watch.', 'Being verbs include am, is, are, was, and were.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'He [is] happy.', labels: { is: 'being verb', happy: 'describes him' }, text: ['Is tells about being.', 'Happy describes him. Happy is not a verb.'] },
      { t: 'compare', title: 'Is can work two ways', items: [ { mode: 'verb', s: 'He [is] happy.', line: 'Is stands alone. The verb is: is' }, { mode: 'verb', s: 'He [is] [running].', line: 'Is helps running. The verb is: is running' } ], text: ['Is can stand alone, or it can help another verb.'] },
      { t: 'guided', coach: 'Which word tells about being? Tap it.', q: { mode: 'verb', s: 'I [am] ready.', h: 'Look for a BE word: am, is, are, was, were.', ex: 'Am is the being verb. Ready describes me.', notes: { ready: 'Ready describes me. It is not a verb.' } } },
      { t: 'try', q: { mode: 'verb', s: 'The ball [was] in the grass.', h: 'Look for a BE word.', ex: 'Was is the being verb. It is the only verb in the sentence.', notes: { grass: 'Grass is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: 'She [is] [running].', ask: 'What is she doing?', h: 'Here is helps another verb. Find both words.', ex: 'Is helps running. The verb is: is running.' } }
    ] },
    { id: 'C', title: 'Memorize the Helpers', skill: 'helpers', key: 'There are 23 helping verbs in four families.', steps: [
      { t: 'explain', title: 'Helping verbs', text: ['Some short verbs can help another verb.', 'There are 23 of them, in four families.', 'Learn one family at a time. You do not need them all today!'] },
      { t: 'cards' },
      { t: 'mc', q: { q: 'BE family: am, is, are, ___, were', c: ['has', 'was', 'can'], a: 1, h: 'Say the chant: am, is, are, ...', ex: 'am, is, are, WAS, were.' } },
      { t: 'mc', q: { q: 'HAVE family: have, ___, had', c: ['has', 'is', 'did'], a: 0, h: 'It starts with h, like have and had.', ex: 'have, HAS, had.' } },
      { t: 'mc', q: { q: 'DO family: do, does, ___', c: ['may', 'am', 'did'], a: 2, h: 'It starts with d, like do and does.', ex: 'do, does, DID.' } },
      { t: 'mc', q: { q: 'OTHER HELPERS: can, could, may, ___, must', c: ['might', 'were', 'does'], a: 0, h: 'It starts with m, like may and must.', ex: 'can, could, may, MIGHT, must.' } },
      { t: 'explain', title: 'Not always helpers!', text: ['These words do not ALWAYS help.', 'Sometimes one of them is the main verb all by itself.'] },
      { t: 'compare', title: 'Have can work two ways', items: [ { mode: 'verb', s: 'I [have] a glove.', line: 'Have is the main verb. Nothing comes after it to help.' }, { mode: 'verb', s: 'I [have] [packed] my bag.', line: 'Have helps packed. The verb team is: have packed' } ] },
      { t: 'try', q: { mode: 'verb', s: 'She [has] a red bike.', h: 'Is there another verb after has?', ex: 'Has is the only verb. It is the main verb here.', notes: { red: 'Red describes the bike.', bike: 'Bike is a thing.' } } }
    ] },
    { id: 'D', title: 'Find the Whole Verb Team', skill: 'team', key: 'A helping verb works with a main verb. Find every verb word in the team.', steps: [
      { t: 'explain', title: 'Verb teams', text: ['A helping verb works with a main verb.', 'Together, they make a verb team.', 'Find EVERY verb word in the team.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'The boy [was] [playing] yesterday.', labels: { was: 'helper', playing: 'main verb' }, text: ['was = helper', 'playing = main verb', 'was playing = the whole verb team'] },
      { t: 'explain', title: 'Coach tip: ask a question', text: ['Ask: What was the boy doing?', 'Answer: was playing.', 'Do not stop too soon. Do not add extra words.'] },
      { t: 'guided', coach: 'What are we doing? Tap EVERY word in the verb team.', q: { mode: 'verb', s: 'We [are] [reading].', ask: 'What are we doing?', h: 'Are is a helper. Which verb does it help?', ex: 'Are helps reading. The verb team is: are reading.' } },
      { t: 'try', q: { mode: 'verb', s: 'She [has] [finished].', ask: 'What has she done?', h: 'Has can help another verb.', ex: 'Has helps finished. The verb team is: has finished.' } },
      { t: 'try', q: { mode: 'verb', s: 'He [can] [swim].', ask: 'What can he do?', h: 'Can is a helper. What can he do?', ex: 'Can helps swim. The verb team is: can swim.' } },
      { t: 'try', q: { mode: 'verb', s: 'They [will] [practice].', ask: 'What will they do?', h: 'Will is a helper. What will they do?', ex: 'Will helps practice. The verb team is: will practice.' } }
    ] },
    { id: 'E', title: 'Longer Verb Teams', skill: 'long', optional: true, key: 'A verb team can have more than two verb words.', steps: [
      { t: 'explain', title: 'Bigger teams', text: ['A verb team can have more than two verb words.', 'Look for helpers in a row. Keep going until you reach the main verb.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'He [has] [been] [practicing].', labels: { has: 'helper', been: 'helper', practicing: 'main verb' }, text: ['has = helper, been = helper', 'practicing = main verb', 'The team: has been practicing'] },
      { t: 'guided', coach: 'This team has THREE verb words. Tap all three.', q: { mode: 'verb', s: 'We [will] [be] [reading].', ask: 'What will we be doing?', h: 'Will and be are helpers. What will we be doing?', ex: 'Will and be help reading. The team is: will be reading.' } },
      { t: 'try', q: { mode: 'verb', s: 'She [had] [been] [waiting] for the bus.', ask: 'What had she been doing?', h: 'Start at had. Keep going until the main verb.', ex: 'Had and been help waiting. The team is: had been waiting.', notes: { bus: 'Bus is a thing.' } } }
    ] },
    { id: 'F', title: 'Ending Clues', skill: 'endings', key: '-ed and -ing are clues, but read the sentence to be sure.', steps: [
      { t: 'explain', title: 'Word endings', text: ['-ed and -ing are word endings.', 'They can help us notice verbs.', 'But we must read the whole sentence to be sure.'] },
      { t: 'table', title: 'Watch the endings', head: ['Now', 'Past (-ed)', 'With -ing'], rows: [['play', 'played', 'playing'], ['jump', 'jumped', 'jumping'], ['help', 'helped', 'helping']] },
      { t: 'table', title: 'Some verbs change instead', head: ['Now', 'Past'], rows: [['run', 'ran'], ['eat', 'ate'], ['catch', 'caught'], ['write', 'wrote']], text: ['These verbs do not use -ed. They change to a new word.'] },
      { t: 'compare', title: 'Not every -ing word is a verb', items: [ { mode: 'verb', s: 'The boy [is] [running].', line: 'Running tells what the boy is doing. Verb team: is running' }, { mode: 'verb', s: 'The running shoes [are] red.', labels: { running: 'describes shoes' }, line: 'Running describes the shoes. The verb is: are' } ] },
      { t: 'try', q: { mode: 'verb', s: 'The running shoes [are] red.', h: 'Careful! Does running describe the shoes here?', ex: 'Are is the verb. Running describes the shoes.', notes: { running: 'Here running describes the shoes. It is not a verb in this sentence.', red: 'Red describes the shoes.' } } },
      { t: 'try', q: { mode: 'verb', s: 'Jada [jumped] over the rope.', ask: 'What did Jada do?', h: 'Look for the -ed clue. Does it show what Jada did?', ex: 'Jumped tells what Jada did.', notes: { rope: 'Rope is a thing.' } } }
    ] },
    { id: 'G', title: 'Challenge: Words in Between', skill: 'challenge', optional: true, key: 'Other words can sit between verb words. Leave them out.', steps: [
      { t: 'explain', title: 'Sneaky words', text: ['Sometimes other words sit between verb words.', 'Words like not and easily are NOT verbs.', 'Skip them, but still find every verb word.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'The boy [is] not [sleeping].', labels: { is: 'helper', sleeping: 'main verb', not: 'not a verb' }, text: ['Verb words: is, sleeping', 'Not is not a verb. Leave it out.'] },
      { t: 'show', title: 'Another one', mode: 'verb', s: 'She [can] easily [catch] the ball.', labels: { can: 'helper', catch: 'main verb', easily: 'tells how' }, text: ['Verb words: can, catch', 'Easily tells how. It is not a verb.'] },
      { t: 'guided', coach: 'Find the helper and the main verb. Skip the word in between.', q: { mode: 'verb', s: 'We [will] soon [eat] dinner.', ask: 'What will we do?', h: 'Soon tells when. Skip it.', ex: 'Will and eat are the verb words. Soon is not a verb.', notes: { soon: 'Soon tells WHEN. It is not a verb.', dinner: 'Dinner is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: '[Can] you [hit] the ball?', ask: 'What can you do?', h: 'In a question, the helper can come first.', ex: 'Can and hit are the verb words. In a question, the helper moves to the front.', notes: { you: 'You is a pronoun. It is not a verb.' } } }
    ] }
  ],

  nouns: [
    { id: 'A', title: 'People Nouns', skill: 'people', key: 'A noun can name a person.', steps: [
      { t: 'explain', title: 'Nouns name things', text: ['A noun names a person, place, thing, or idea.', 'Today we start with people.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'The [coach:p] smiled.', labels: { coach: 'person' }, text: ['Coach names a person.', 'We draw ONE line under a noun.'] },
      { t: 'words', title: 'People nouns', groups: [ { name: 'People', words: ['mom', 'teacher', 'coach', 'friend', 'baby', 'pilot'] } ] },
      { t: 'guided', coach: 'Who waved? Tap the noun that names a person.', q: { mode: 'noun', s: 'My [friend:p] waved.', h: 'Who did the waving?', ex: 'Friend names a person.' } },
      { t: 'try', q: { mode: 'noun', s: 'The [doctor:p] helped me.', h: 'Who helped?', ex: 'Doctor names a person.', notes: { me: 'Me is a pronoun. It stands in for a noun, so we do not tap it here.' } } }
    ] },
    { id: 'B', title: 'Place Nouns', skill: 'places', key: 'A noun can name a place.', steps: [
      { t: 'explain', title: 'Places', text: ['A noun can name a place.', 'Ask: Where?'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'We went to the [park:l].', labels: { park: 'place' }, text: ['Park names a place.'] },
      { t: 'words', title: 'Place nouns', groups: [ { name: 'Places', words: ['park', 'school', 'kitchen', 'field', 'store', 'beach'] } ] },
      { t: 'guided', coach: 'Where did the kids run? Tap the PLACE noun only.', q: { mode: 'noun', want: 'l', s: 'The [kids:p] ran to the [park:l].', h: 'Ask: Where did they run?', ex: 'Park names a place. Kids is a noun too, but it names people.' } },
      { t: 'try', q: { mode: 'noun', want: 'l', s: '[Grandma:p] lives on a [farm:l].', h: 'Where does Grandma live?', ex: 'Farm names a place.' } }
    ] },
    { id: 'C', title: 'Thing Nouns', skill: 'things', key: 'A noun can name a thing. Animals count too!', steps: [
      { t: 'explain', title: 'Things', text: ['A noun can name a thing.', 'Animals are living things, so they are nouns too.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'I found a [ball:t].', labels: { ball: 'thing' }, text: ['Ball names a thing.'] },
      { t: 'guided', coach: 'Find BOTH nouns: the animal and the thing.', q: { mode: 'noun', s: 'The [dog:t] chewed a [bone:t].', h: 'Who chewed? What did it chew?', ex: 'Dog names an animal. Bone names a thing.' } },
      { t: 'try', q: { mode: 'noun', want: 't', s: '[Dad:p] fixed the [car:t].', h: 'What did Dad fix?', ex: 'Car names a thing. Dad is a person.' } }
    ] },
    { id: 'D', title: 'Common & Proper Nouns', skill: 'proper', key: 'A proper noun is a special name. It starts with a capital letter.', steps: [
      { t: 'explain', title: 'Common or proper?', text: ['A common noun names any person, place, or thing: boy, city, dog.', 'A proper noun is a special name: Marcus, Atlanta, Rex.', 'Proper nouns start with a capital letter.'] },
      { t: 'table', title: 'Common and proper', head: ['Common noun', 'Proper noun'], rows: [['boy', 'Marcus'], ['city', 'Atlanta'], ['dog', 'Rex'], ['holiday', 'Thanksgiving']] },
      { t: 'guided', coach: 'What is the dog’s special name? Tap the PROPER noun.', q: { mode: 'noun', want: 'P', s: 'My [dog:t] [Rex:tP] can run fast.', h: 'Look for the capital letter in the middle of the sentence.', ex: 'Rex is a special name, so it is a proper noun. Dog is a common noun.' } },
      { t: 'try', q: { mode: 'noun', want: 'P', s: '[Maya:pP] lives in [Georgia:lP].', h: 'There are two special names.', ex: 'Maya and Georgia are proper nouns.' } }
    ] },
    { id: 'E', title: 'More Than One Noun', skill: 'multi', key: 'A sentence can have many nouns. Find them all!', steps: [
      { t: 'explain', title: 'Find them all', text: ['A sentence can have more than one noun.', 'Check every word. Ask: person? place? thing?'] },
      { t: 'show', title: 'Watch me find them', mode: 'noun', s: '[Chris:p] carries a [bat:t].', labels: { chris: 'person', bat: 'thing' }, text: ['Chris names a person.', 'Bat names a thing.'] },
      { t: 'show', title: 'Another one', mode: 'noun', s: 'The [coach:p] stood on the [field:l].', labels: { coach: 'person', field: 'place' }, text: ['Coach names a person.', 'Field names a place.'] },
      { t: 'guided', coach: 'Find ALL THREE nouns.', q: { mode: 'noun', s: 'My [sister:p] found a [shell:t] at the [beach:l].', h: 'A person, a thing, and a place.', ex: 'Sister is a person. Shell is a thing. Beach is a place.' } },
      { t: 'try', q: { mode: 'noun', s: '[Grandma:p] baked a [pie:t] in the [kitchen:l].', h: 'Who? What? Where?', ex: 'Grandma is a person. Pie is a thing. Kitchen is a place.' } }
    ] },
    { id: 'F', title: 'Idea Nouns', skill: 'ideas', key: 'Some nouns name ideas or feelings you cannot touch.', steps: [
      { t: 'explain', title: 'Ideas are nouns too', text: ['Some nouns name ideas or feelings.', 'You cannot touch them, but they are still nouns.', 'Examples: kindness, joy, courage, friendship.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'Her [kindness:i] made me happy.', labels: { kindness: 'idea' }, text: ['Kindness names an idea.'] },
      { t: 'try', q: { mode: 'noun', want: 'i', s: 'We felt [joy:i] at the [game:t].', h: 'Which noun names a feeling?', ex: 'Joy names a feeling, which is an idea. Game is a noun too, but it is an event (a thing).' } }
    ] }
  ],

  adjectives: [
    { id: 'A', title: 'What Kind?', skill: 'kind', key: 'An adjective describes a noun.', steps: [
      { t: 'explain', title: 'Adjectives', text: ['An adjective describes a noun.', 'It can tell what kind, which one, or how many.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adj', s: 'The [red@ball] ball rolled.', text: ['Red describes ball.', 'It tells what kind of ball.'] },
      { t: 'show', title: 'Another one', mode: 'adj', s: 'The [small@puppy] puppy sleeps.', text: ['Small describes puppy.'] },
      { t: 'guided', coach: 'First find the noun. Then find the word that describes it.', q: { mode: 'adj', s: 'The [brown@dog] dog barked.', h: 'What kind of dog?', ex: 'Brown describes dog.' } },
      { t: 'try', q: { mode: 'adj', s: 'We ate [warm@bread] bread.', h: 'What kind of bread?', ex: 'Warm describes bread.' } }
    ] },
    { id: 'B', title: 'How Many?', skill: 'many', key: 'Number words can be adjectives. They tell how many.', steps: [
      { t: 'explain', title: 'How many?', text: ['Some adjectives tell how many.', 'Number words like two and five can describe a noun.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adj', s: '[Three@players] players ran.', text: ['Three tells how many players.'] },
      { t: 'guided', coach: 'Find the noun. Then ask: how many?', q: { mode: 'adj', s: '[Five@birds] birds sat on the fence.', h: 'How many birds?', ex: 'Five describes birds.' } },
      { t: 'try', q: { mode: 'adj', s: 'I have [two@cookies] cookies.', h: 'How many cookies?', ex: 'Two describes cookies.' } }
    ] },
    { id: 'C', title: 'Which One?', skill: 'which', key: 'Some adjectives tell which one.', steps: [
      { t: 'explain', title: 'Which one?', text: ['Some adjectives tell which one.', 'Words like first, last, and next can do this.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adj', s: 'The [last@player] player ran home.', text: ['Last tells which player.'] },
      { t: 'try', q: { mode: 'adj', s: 'We will win the [next@game] game.', h: 'Which game?', ex: 'Next describes game. It tells which one.' } }
    ] },
    { id: 'D', title: 'Find the Noun First', skill: 'link', key: 'Find the noun. Ask what describes it. Tap the adjective.', steps: [
      { t: 'explain', title: 'Four steps', text: ['1. Find the noun.', '2. Ask: what kind? which one? how many?', '3. Tap the describing word.', '4. Draw an arrow to the noun it describes.'] },
      { t: 'guided', coach: 'Step 1: find the noun.', q: { mode: 'adj', s: 'The [loud@crowd] crowd cheered.', h: 'What kind of crowd?', ex: 'Loud describes crowd.' } },
      { t: 'try', q: { mode: 'adj', s: 'The [muddy@shoes] shoes are by the door.', h: 'What kind of shoes?', ex: 'Muddy describes shoes.' } }
    ] },
    { id: 'E', title: 'More Than One Adjective', skill: 'multi', key: 'A sentence can have more than one adjective.', steps: [
      { t: 'explain', title: 'Look for more', text: ['A sentence can have more than one adjective.', 'Check every noun.'] },
      { t: 'show', title: 'Watch me find them', mode: 'adj', s: 'The [little@kitten] kitten has [green@eyes] eyes.', text: ['Little describes kitten.', 'Green describes eyes.'] },
      { t: 'try', q: { mode: 'adj', s: 'The [old@tree] tree has [many@leaves] leaves.', h: 'What kind of tree? How many leaves?', ex: 'Old describes tree. Many describes leaves.' } }
    ] }
  ],

  adverbs: [
    { id: 'A', title: 'How?', skill: 'how', key: 'An adverb can tell HOW something happens.', steps: [
      { t: 'explain', title: 'Adverbs', text: ['An adverb can describe a verb.', 'It can tell how, when, or where.', 'Today: HOW.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adv', s: 'Chris runs [quickly@runs:how].', text: ['Quickly tells HOW Chris runs.'] },
      { t: 'guided', coach: 'Find the verb moved. Then ask: HOW did the turtle move?', q: { mode: 'adv', s: 'The turtle moved [slowly@moved:how].', h: 'How did the turtle move?', ex: 'Slowly tells HOW the turtle moved.' } },
      { t: 'try', q: { mode: 'adv', s: 'The team played [well@played:how].', h: 'How did the team play?', ex: 'Well tells HOW they played. Not every adverb ends in -ly!' } }
    ] },
    { id: 'B', title: 'When?', skill: 'when', key: 'An adverb can tell WHEN something happens.', steps: [
      { t: 'explain', title: 'When?', text: ['Some adverbs tell WHEN.', 'Examples: yesterday, today, soon, later.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adv', s: 'We practiced [yesterday@practiced:when].', text: ['Yesterday tells WHEN we practiced.'] },
      { t: 'try', q: { mode: 'adv', s: 'The bus will come [soon@come:when].', h: 'When will the bus come?', ex: 'Soon tells WHEN.' } }
    ] },
    { id: 'C', title: 'Where?', skill: 'where', key: 'An adverb can tell WHERE something happens.', steps: [
      { t: 'explain', title: 'Where?', text: ['Some adverbs tell WHERE.', 'Examples: outside, here, upstairs, away.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adv', s: 'The children played [outside@played:where].', text: ['Outside tells WHERE the children played.'] },
      { t: 'try', q: { mode: 'adv', s: 'The cat ran [upstairs@ran:where].', h: 'Where did the cat run?', ex: 'Upstairs tells WHERE.' } }
    ] },
    { id: 'D', title: 'Adjective or Adverb?', skill: 'compare', key: 'Ask what the word describes: a noun (adjective) or a verb (adverb).', steps: [
      { t: 'compare', title: 'Careful or carefully?', items: [ { mode: 'adj', s: 'The [careful@player] player throws.', line: 'Careful describes player, a noun. It is an ADJECTIVE.' }, { mode: 'adv', s: 'The player throws [carefully@throws:how].', line: 'Carefully describes throws, a verb. It is an ADVERB.' } ] },
      { t: 'explain', title: 'The -ly clue', text: ['Many adverbs end in -ly, but not all of them do.', 'Fast and well are adverbs with no -ly.', 'Friendly ends in -ly, but in "the friendly dog" it describes a noun.'] },
      { t: 'mc', q: { q: 'The careful player throws.\nWhat does careful describe?', c: ['player — so careful is an adjective', 'throws — so careful is an adverb'], a: 0, h: 'Ask: a careful what?', ex: 'Careful describes the player, a noun. So it is an adjective.' } },
      { t: 'try', q: { mode: 'adv', s: 'The quiet girl spoke [quietly@spoke:how].', h: 'Which word tells HOW she spoke?', ex: 'Quietly tells how she spoke. Quiet describes the girl, so it is an adjective.', notes: { quiet: 'Quiet describes the girl, a noun. That makes it an adjective.' } } }
    ] }
  ],

  vowels: [
    { id: 'A', title: 'Vowel Letters', skill: 'letters', key: 'The vowel letters are a, e, i, o, u.', steps: [
      { t: 'explain', title: 'Meet the vowels', text: ['The vowel letters are a, e, i, o, and u.', 'Every word has at least one vowel sound.'], tiles: ['a', 'e', 'i', 'o', 'u'] },
      { t: 'mc', q: { q: 'Which one is a vowel letter?', c: ['b', 'e', 't'], a: 1, h: 'The vowels are a, e, i, o, u.', ex: 'E is a vowel letter.' } },
      { t: 'mc', q: { q: 'Which letter in the word cup is a vowel?', c: ['c', 'u', 'p'], a: 1, h: 'Check each letter: c, u, p.', ex: 'U is the vowel letter in cup.' } }
    ] },
    { id: 'B', title: 'Short Vowel Sounds', skill: 'short', key: 'One vowel between two consonants often makes a short sound.', steps: [
      { t: 'explain', title: 'Short vowels', text: ['When one vowel sits between two consonants, it often makes a short sound.', 'This is called the CVC pattern, like c-a-t.'] },
      { t: 'words', title: 'Short vowel words', say: true, groups: [ { name: 'short a', words: ['cap', 'cat'] }, { name: 'short e', words: ['bed', 'ten'] }, { name: 'short i', words: ['kit', 'pig'] }, { name: 'short o', words: ['hop', 'dog'] }, { name: 'short u', words: ['cup', 'tub'] } ] },
      { t: 'mc', q: { q: 'Which word has the CVC pattern for a short vowel?', c: ['cape', 'hop', 'rain'], a: 1, say: true, h: 'Find one vowel between two consonants.', ex: 'Hop is h-o-p: one vowel between two consonants.' } }
    ] },
    { id: 'C', title: 'Long Vowel Sounds', skill: 'long', key: 'A long vowel says its own name.', steps: [
      { t: 'explain', title: 'Long vowels', text: ['A long vowel says its own name.', 'Long a as in cake, long i as in kite, long o as in home.', 'Long e as in me, long u as in cute.'] },
      { t: 'mc', q: { q: 'In kite, the i says its name. What kind of vowel sound is that?', c: ['long', 'short'], a: 0, say: true, h: 'When a vowel says its own name, it is...', ex: 'When a vowel says its name, it is a long vowel.' } }
    ] },
    { id: 'D', title: 'Silent e', skill: 'silente', key: 'Silent e often helps the earlier vowel say its name.', steps: [
      { t: 'explain', title: 'The silent e', text: ['Silent e often helps the earlier vowel say its name.', 'You do not hear the e at the end.'] },
      { t: 'table', title: 'Add an e and watch', say: true, head: ['Short', 'Add silent e → Long'], rows: [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['tub', 'tube']] },
      { t: 'explain', title: 'Not always!', text: ['Silent e does not ALWAYS work this way.', 'In have and give, the e is silent, but the vowel is short.', 'So use it as a strong clue, not a promise.'] },
      { t: 'mc', q: { q: 'Add silent e to hop. What new word do you make?', c: ['hope', 'hip', 'hops'], a: 0, say: true, h: 'Write hop, then put e at the end.', ex: 'hop + e = hope. The o now says its name.' } }
    ] },
    { id: 'E', title: 'Vowel Team: ai', skill: 'teams', key: 'The team ai often says long a.', steps: [
      { t: 'explain', title: 'Vowel team ai', text: ['Sometimes two vowels work as a team.', 'The team ai often says long a.', 'Examples: rain, tail, paint.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ai?', c: ['ran', 'rain', 'run'], a: 1, say: true, h: 'Look for a and i side by side.', ex: 'Rain has the team ai.' } }
    ] },
    { id: 'F', title: 'Vowel Team: ee', skill: 'teams', key: 'The team ee says long e.', steps: [
      { t: 'explain', title: 'Vowel team ee', text: ['The team ee says long e.', 'Examples: feet, seed, tree.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ee?', c: ['fed', 'feet', 'fit'], a: 1, say: true, h: 'Look for two e letters side by side.', ex: 'Feet has the team ee.' } }
    ] },
    { id: 'G', title: 'Vowel Team: ea', skill: 'teams', key: 'The team ea often says long e.', steps: [
      { t: 'explain', title: 'Vowel team ea', text: ['The team ea often says long e.', 'Examples: team, seat, beach.', 'Sometimes ea says short e, like in bread. We practice the long e way first.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ea?', c: ['set', 'seat', 'sit'], a: 1, say: true, h: 'Look for e and a side by side.', ex: 'Seat has the team ea.' } }
    ] },
    { id: 'H', title: 'Vowel Team: oa', skill: 'teams', key: 'The team oa says long o.', steps: [
      { t: 'explain', title: 'Vowel team oa', text: ['The team oa says long o.', 'Examples: boat, coat, road.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team oa?', c: ['cot', 'cut', 'coat'], a: 2, say: true, h: 'Look for o and a side by side.', ex: 'Coat has the team oa.' } }
    ] }
  ],

  reading: [
    { id: 'A', title: 'Main Idea', skill: 'main', key: 'The main idea is what the whole passage is mostly about.', steps: [
      { t: 'explain', title: 'Main idea', text: ['The main idea is what a passage is MOSTLY about.', 'It is bigger than one detail.', 'Tip: ask, "What do most sentences talk about?"'] },
      { t: 'reading', mini: ['Dogs help people in many ways.', 'Some dogs guide people who cannot see.', 'Some dogs help find people who are lost.', 'Other dogs visit hospitals to cheer people up.'], q: { q: 'What is this mostly about?', c: ['Dogs visit hospitals.', 'Dogs help people in many ways.', 'Dogs like to play fetch.'], a: 1, h: 'Which answer covers ALL the sentences, not just one?', ex: 'Every sentence tells a way dogs help. Visiting hospitals is only one detail.' } }
    ] },
    { id: 'B', title: 'Supporting Details', skill: 'detail', key: 'Details are facts that tell more about the main idea.', steps: [
      { t: 'explain', title: 'Details', text: ['Details are small facts in the passage.', 'They tell more about the main idea.', 'You can point to them in the text.'] },
      { t: 'reading', mini: ['Ms. Lee’s class grew bean plants.', 'They put the seeds in cups of soil.', 'They watered the cups every Monday.', 'In two weeks, green sprouts popped up.'], q: { q: 'When did the class water the cups?', c: ['Every Monday', 'Every Friday', 'Once a month'], a: 0, h: 'Find the word watered. Read that sentence.', ex: 'The passage says they watered the cups every Monday.' } }
    ] },
    { id: 'C', title: 'Sequence', skill: 'sequence', key: 'Sequence is the order things happen.', steps: [
      { t: 'explain', title: 'Sequence', text: ['Sequence is the order things happen.', 'Signal words help: first, next, then, last.'] },
      { t: 'reading', mini: ['First, Zoe got out the bread.', 'Next, she spread peanut butter on it.', 'Then she added banana slices.', 'Last, she ate her snack.'], q: { q: 'What did Zoe do right after she spread peanut butter?', c: ['She got out the bread.', 'She added banana slices.', 'She ate her snack.'], a: 1, h: 'Find "peanut butter." Then look for the signal word that comes after it.', ex: 'After peanut butter comes "Then she added banana slices."' } }
    ] },
    { id: 'D', title: 'Making an Inference', skill: 'inference', key: 'Use a clue from the story and what you already know.', steps: [
      { t: 'explain', title: 'Inference', text: ['Sometimes the story does not say everything.', 'Use a clue from the story and what you already know.', 'Clue + what I know = inference.'] },
      { t: 'reading', mini: ['Ben came inside and shook off his umbrella.', 'His boots left wet tracks on the floor.', 'He hung his dripping coat on the hook.'], q: { q: 'What was the weather most likely like outside?', c: ['Sunny and dry', 'Rainy', 'Snowy and windy'], a: 1, h: 'Clues: umbrella, wet tracks, dripping coat. What do you know about umbrellas?', ex: 'Clues: umbrella and dripping coat. I know people use umbrellas in the rain. So it was rainy.' } }
    ] },
    { id: 'E', title: 'Vocabulary in Context', skill: 'vocab', key: 'Use the words around a new word to figure out what it means.', steps: [
      { t: 'explain', title: 'Word detective', text: ['When you see a new word, read the sentences around it.', 'Those clues can tell you what the word means.'] },
      { t: 'reading', mini: ['The puppy was so tiny that it fit inside a teacup.', 'It was smaller than a shoe.'], q: { q: 'What does tiny mean?', c: ['Very small', 'Very loud', 'Very fast'], a: 0, h: 'Clues: fit inside a teacup, smaller than a shoe.', ex: 'Something that fits in a teacup is very small. Tiny means very small.' } }
    ] },
    { id: 'F', title: 'Finding Evidence', skill: 'evidence', key: 'Evidence is the sentence in the text that proves your answer.', steps: [
      { t: 'explain', title: 'Prove it!', text: ['Evidence is a sentence from the text that proves your answer.', 'Good readers can point to it.', 'In this app, you tap the sentence.'] },
      { t: 'reading', ev: true, mini: ['Ava wanted to make the team.', 'She practiced catching every day after school.', 'On try-out day, she caught every ball.', 'The coach smiled and handed her a jersey.'], q: { q: 'Tap the sentence that shows Ava worked hard.', ok: [1], h: 'Which sentence tells something she did again and again?', ex: '"She practiced catching every day after school." shows hard work.' } }
    ] }
  ]
};

/* ───────────────────────── HELPER FAMILIES ───────────────────────── */
var HELPER_FAMILIES = [
  { name: 'BE family', words: ['am', 'is', 'are', 'was', 'were', 'be', 'being', 'been'] },
  { name: 'HAVE family', words: ['have', 'has', 'had'] },
  { name: 'DO family', words: ['do', 'does', 'did'] },
  { name: 'OTHER HELPERS', words: ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'] }
];
