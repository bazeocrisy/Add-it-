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
  { id: 'workshop', name: 'Sentence Workshop', short: 'Workshop', mode: 'ws', icon: 'pencil', blurb: 'Compare, fix, combine, and improve sentences.' },
  { id: 'vowels', name: 'Word Study', short: 'Word Study', mode: 'vowel', icon: 'abc', blurb: 'Syllables, prefixes, suffixes, and spelling, with a vowel review.' },
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
    { id: 'challenge', name: 'Challenge: words in between', lesson: 'G', optional: true },
    { id: 'multi', name: 'Finding every verb', lesson: 'H' },
    { id: 'agree', name: 'Subject-verb agreement', lesson: 'I' },
    { id: 'past', name: 'Past tense (regular and irregular)', lesson: 'J' },
    { id: 'tense', name: 'Keeping verb tense consistent', lesson: 'K' }
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
    { id: 'multi', name: 'More than one adjective', lesson: 'E' },
    { id: 'after', name: 'Adjectives after linking verbs', lesson: 'F' },
    { id: 'compare', name: 'Comparing with adjectives (-er, -est)', lesson: 'G' }
  ],
  adverbs: [
    { id: 'how', name: 'Adverbs: How?', lesson: 'A' },
    { id: 'when', name: 'Adverbs: When?', lesson: 'B' },
    { id: 'where', name: 'Adverbs: Where?', lesson: 'C' },
    { id: 'compare', name: 'Adjective or adverb?', lesson: 'D' },
    { id: 'comparead', name: 'Comparing with adverbs', lesson: 'E' }
  ],
  vowels: [
    { id: 'letters', name: 'Review: vowel letters', lesson: 'A', foundation: true },
    { id: 'short', name: 'Review: short vowels', lesson: 'B', foundation: true },
    { id: 'long', name: 'Review: long vowels', lesson: 'C', foundation: true },
    { id: 'silente', name: 'Review: silent e', lesson: 'D', foundation: true },
    { id: 'teams', name: 'Review: vowel teams', lesson: 'E', foundation: true },
    { id: 'syll', name: 'Syllables in longer words', lesson: 'I' },
    { id: 'across', name: 'Vowel patterns across syllables', lesson: 'J' },
    { id: 'prefix', name: 'Prefixes', lesson: 'K' },
    { id: 'suffix', name: 'Suffixes', lesson: 'L' },
    { id: 'spell', name: 'Spelling patterns in sentences', lesson: 'M' }
  ],
  workshop: [
    { id: 'precise', name: 'Precise adjectives and adverbs', lesson: 'A' },
    { id: 'compound', name: 'Compound sentences', lesson: 'B' },
    { id: 'complex', name: 'Complex sentences', lesson: 'C' },
    { id: 'revise', name: 'Combining and revising', lesson: 'D' }
  ],
  reading: [
    { id: 'main', name: 'Main idea', lesson: 'A' },
    { id: 'detail', name: 'Supporting details', lesson: 'B' },
    { id: 'sequence', name: 'Sequence', lesson: 'C' },
    { id: 'inference', name: 'Making an inference', lesson: 'D' },
    { id: 'vocab', name: 'Vocabulary in context', lesson: 'E' },
    { id: 'evidence', name: 'Finding evidence', lesson: 'F' },
    { id: 'theme', name: 'Theme / lesson', lesson: 'G' },
    { id: 'problem', name: 'Character problem and solution', lesson: 'H' }
  ]
};

/* ───────────────────────── VERB QUESTION BANK (59) ───────────────────────── */
var VERB_BANK = [
  // Single action verbs
  { id: 'v1', sk: 'action', s: 'During science class, Keisha carefully [poured] blue water into a tall glass jar.', ask: 'What did Keisha do?', h: 'Keisha did something with the blue water. Which word shows that action?', ex: 'Poured tells what Keisha did with the water. It is the only action verb in the sentence.', notes: { carefully: 'Carefully tells HOW Keisha poured. It is an adverb, not a verb.', water: 'Here water is the thing in the jar, so it is a noun. Find what Keisha DID.', tall: 'Tall describes the jar. It is not a verb.' } },
  { id: 'v2', sk: 'action', s: 'The curious raccoon [crept] quietly across the dark porch after midnight.', ask: 'What did the raccoon do?', h: 'Creep changes to a new word when it happened in the past. Find it.', ex: 'Crept is the past form of creep. It tells what the raccoon did.', notes: { quietly: 'Quietly tells HOW the raccoon moved. It is an adverb, not a verb.', curious: 'Curious describes the raccoon. It is not a verb.', across: 'Across starts the words that tell where. It is not a verb.' } },
  { id: 'v3', sk: 'action', s: 'At the library, Marcus [wondered] about the giant whales in his new book.', ask: 'What did Marcus do?', h: 'This action happens inside Marcus’s head. Find the thinking word.', ex: 'Wondered is a thinking action. It tells what Marcus did in his mind.', notes: { book: 'Here book is a thing Marcus reads, so it is a noun.', giant: 'Giant describes the whales. It is not a verb.', library: 'Library is a place (a noun).' } },
  { id: 'v4', sk: 'action', s: 'On Saturday morning, Grandpa [built] a sturdy wooden birdhouse for the backyard.', ask: 'What did Grandpa do?', h: 'Build changes to a new word in the past. Which word tells what Grandpa did?', ex: 'Built is the past form of build. It tells what Grandpa did.', notes: { sturdy: 'Sturdy describes the birdhouse. It is not a verb.', wooden: 'Wooden describes the birdhouse. It is not a verb.', birdhouse: 'Birdhouse is a thing (a noun). What did Grandpa DO?' } },
  { id: 'v5', sk: 'action', s: 'The gentle zookeeper [fed] the hungry giraffes with fresh green leaves.', ask: 'What did the zookeeper do?', h: 'Feed changes to a new word in the past. Look for it.', ex: 'Fed is the past form of feed. It tells what the zookeeper did.', notes: { leaves: 'Here leaves are things the giraffes eat, so it is a noun, not a verb.', hungry: 'Hungry describes the giraffes. It is not a verb.', gentle: 'Gentle describes the zookeeper. It is not a verb.' } },
  { id: 'v6', sk: 'action', s: 'Before the big test, Aaliyah [remembered] every step of the water cycle.', ask: 'What did Aaliyah do?', h: 'Some actions happen in your brain. What did Aaliyah do in her mind?', ex: 'Remembered is a thinking verb. It tells what Aaliyah did.', notes: { test: 'Here test is a thing (the big test), so it is a noun.', step: 'Here step is a thing (every step), so it is a noun.', cycle: 'Cycle is a thing (a noun).' } },
  { id: 'v7', sk: 'action', s: 'In the noisy cafeteria, my best friend [shared] her crunchy apple slices with me.', ask: 'What did my best friend do?', h: 'What did my friend do with the apple slices?', ex: 'Shared tells what my friend did. It is the only verb in the sentence.', notes: { noisy: 'Noisy describes the cafeteria. It is not a verb.', crunchy: 'Crunchy describes the apple slices. It is not a verb.', slices: 'Slices are things (nouns).' } },
  { id: 'v8', sk: 'action', s: 'Thick gray clouds [drifted] slowly over the mountains before the afternoon storm.', ask: 'What did the clouds do?', h: 'Picture the clouds in the sky. What did they do?', ex: 'Drifted tells what the clouds did. The -ed ending shows it happened in the past.', notes: { slowly: 'Slowly tells HOW the clouds drifted. It is an adverb, not a verb.', storm: 'Here storm is a thing (the afternoon storm), so it is a noun.', thick: 'Thick describes the clouds. It is not a verb.' } },
  { id: 'v9', sk: 'action', s: 'Our museum guide [showed] us an ancient dinosaur bone from Montana.', ask: 'What did our guide do?', h: 'What did the guide do with the dinosaur bone?', ex: 'Showed tells what the guide did. It is the verb.', notes: { guide: 'Here guide names a person, so it is a noun.', ancient: 'Ancient describes the bone. It is not a verb.', us: 'Us is a pronoun. It is not a verb.' } },
  { id: 'v10', sk: 'action', s: 'With a loud splash, the playful otter [dove] into the icy river.', ask: 'What did the otter do?', h: 'Dive changes to a new word in the past. Find what the otter did.', ex: 'Dove is the past form of dive. It tells what the otter did.', notes: { splash: 'Here splash is a thing (a loud splash), so it is a noun.', playful: 'Playful describes the otter. It is not a verb.', icy: 'Icy describes the river. It is not a verb.' } },
  { id: 'v11', sk: 'action', s: 'My little brother [knew] the names of all eight planets.', ask: 'What did my little brother do?', h: 'This is a thinking action. Know changes to a new word in the past.', ex: 'Knew is the past form of know. It is a thinking verb.', notes: { names: 'Here names are things he knew, so it is a noun.', planets: 'Planets are things (nouns).', little: 'Little describes my brother. It is not a verb.' } },
  { id: 'v12', sk: 'action', s: 'After the long field trip, our tired class [rode] the bus back to school.', ask: 'What did our class do?', h: 'Ride changes to a new word in the past. What did the class do on the bus?', ex: 'Rode is the past form of ride. It tells what the class did.', notes: { tired: 'Tired describes the class. It has -ed, but it is not a verb here.', trip: 'Trip is a thing (an event).', back: 'Back tells where. It is not a verb.' } },
  { id: 'v13', sk: 'action', s: 'Every spring, the friendly mail carrier [waves] at the kids on our street.', ask: 'What does the mail carrier do?', h: 'What does the mail carrier do with a hand?', ex: 'Waves tells what the mail carrier does.', notes: { spring: 'Here spring is a season (a noun).', friendly: 'Friendly describes the mail carrier. It is not a verb.', carrier: 'Carrier names a person (a noun).' } },
  { id: 'v14', sk: 'action', s: 'Deshawn [measured] the growing bean plant with a wooden ruler on Monday.', ask: 'What did Deshawn do?', h: 'What did Deshawn do with the ruler?', ex: 'Measured tells what Deshawn did. Growing describes the plant, so it is not a verb here.', notes: { growing: 'Here growing describes the bean plant. It is not a verb in this sentence.', plant: 'Here plant is a thing, so it is a noun.', ruler: 'Ruler is a thing (a noun).' } },

  // Standalone being / having / doing verbs
  { id: 'v15', sk: 'being', s: 'Our classroom hamster [is] very sleepy during the bright afternoon.', h: 'Nobody does an action here. Which word tells about being?', ex: 'Is is the being verb. Sleepy describes the hamster. Is stands alone with no helper role.', notes: { sleepy: 'Sleepy describes the hamster. It is not a verb.', very: 'Very tells how sleepy. It is not a verb.', bright: 'Bright describes the afternoon. It is not a verb.' } },
  { id: 'v16', sk: 'being', s: 'During the long winter, the old barn [was] full of hungry mice.', h: 'Look for a BE family word. Is there an action anywhere?', ex: 'Was is the being verb. Full of hungry mice tells about the barn.', notes: { full: 'Full describes the barn. It is not a verb.', hungry: 'Hungry describes the mice. It is not a verb.', winter: 'Winter is a season (a noun).' } },
  { id: 'v17', sk: 'being', s: 'I [am] proud of my colorful poster about the solar system.', h: 'Look for a BE family word that goes with I.', ex: 'Am is the being verb. Proud describes me.', notes: { proud: 'Proud describes me. It is not a verb.', poster: 'Poster is a thing (a noun).', colorful: 'Colorful describes the poster. It is not a verb.' } },
  { id: 'v18', sk: 'being', s: 'By July, the tomatoes in Grandma’s garden [were] red and juicy.', h: 'Find the BE word. Red and juicy describe the tomatoes.', ex: 'Were is the being verb. Red and juicy describe the tomatoes.', notes: { juicy: 'Juicy describes the tomatoes. It is not a verb.', red: 'Red describes the tomatoes. It is not a verb.', garden: 'Garden is a place (a noun).' } },
  { id: 'v19', sk: 'being', s: 'The new books on the library cart [are] about volcanoes and earthquakes.', h: 'Nobody is doing anything. Which BE word links the books to their topic?', ex: 'Are is the being verb. The books are not doing an action.', notes: { books: 'Here books are things, so it is a noun.', cart: 'Cart is a thing (a noun).', new: 'New describes the books. It is not a verb.' } },
  { id: 'v20', sk: 'being', s: 'Monarch butterflies [have] bright orange wings with thin black lines.', h: 'Have can be the main verb all by itself. Does another verb come after it?', ex: 'Have is the main verb. It tells what the butterflies own. No other verb comes with it.', notes: { wings: 'Wings are things (nouns).', bright: 'Bright describes the wings. It is not a verb.', lines: 'Here lines are things on the wings, so it is a noun.' } },
  { id: 'v21', sk: 'being', s: 'Our town library [has] a cozy corner with beanbags and picture books.', h: 'Look for a HAVE family word. Is it helping another verb?', ex: 'Has is the main verb. It stands alone and tells what the library has.', notes: { cozy: 'Cozy describes the corner. It is not a verb.', corner: 'Corner is a place (a noun).', beanbags: 'Beanbags are things (nouns).' } },
  { id: 'v22', sk: 'being', s: 'Last Friday, the firefighters [had] a pancake breakfast for the whole neighborhood.', h: 'Look for a HAVE family word. Does another verb come right after it?', ex: 'Had is the main verb here. It stands alone.', notes: { breakfast: 'Breakfast is a thing (an event).', whole: 'Whole describes the neighborhood. It is not a verb.', firefighters: 'Firefighters are people (a noun).' } },
  { id: 'v23', sk: 'being', s: 'Every Sunday, my uncle [does] the dishes after our big family dinner.', h: 'Look for a DO family word. Is there another verb after it?', ex: 'Does is the main verb. It tells what my uncle does. No other verb comes with it.', notes: { dishes: 'Dishes are things (nouns).', dinner: 'Dinner is a thing (a meal).', big: 'Big describes the dinner. It is not a verb.' } },
  { id: 'v24', sk: 'being', s: 'On Tuesday, our class [did] a careful experiment with magnets and paper clips.', h: 'Look for a DO family word. Is it helping another verb, or standing alone?', ex: 'Did is the main verb. It tells what our class did.', notes: { experiment: 'Experiment is a thing (a noun).', careful: 'Careful describes the experiment. It is not a verb.', magnets: 'Magnets are things (nouns).' } },

  // Two-word verb teams
  { id: 'v25', sk: 'team', s: 'During indoor recess, Zara [was] [playing] chess with her best friend.', ask: 'What was Zara doing?', h: 'Ask: What was Zara doing? Find every word in that answer.', ex: 'Was is the helper. Playing is the main verb. The whole verb team: was playing.', notes: { chess: 'Chess is a game (a thing). It is not a verb.', indoor: 'Indoor describes the recess. It is not a verb.' } },
  { id: 'v26', sk: 'team', s: 'The second graders [are] [painting] colorful murals in the front hallway.', ask: 'What are the second graders doing?', h: 'Are is a helper. Which -ing word does it help?', ex: 'Are helps painting. The verb team: are painting.', notes: { colorful: 'Colorful describes the murals. It is not a verb.', murals: 'Murals are things (nouns).', hallway: 'Hallway is a place (a noun).' } },
  { id: 'v27', sk: 'team', s: 'Our teacher [has] [hung] our weather charts on the wall by the door.', ask: 'What has our teacher done?', h: 'Has can help another verb. Hang changes to a new word after has.', ex: 'Has helps hung. The verb team: has hung.', notes: { charts: 'Charts are things (nouns).', weather: 'Weather tells what kind of charts. It is not a verb.', wall: 'Wall is a thing (a noun).' } },
  { id: 'v28', sk: 'team', s: 'A hungry pelican [can] [hold] three gallons of water in its pouch.', ask: 'What can a pelican do?', h: 'Can is a helper. What can the pelican do?', ex: 'Can helps hold. The verb team: can hold.', notes: { hungry: 'Hungry describes the pelican. It is not a verb.', water: 'Here water is a thing, so it is a noun.', pouch: 'Pouch is a thing (a noun).' } },
  { id: 'v29', sk: 'team', s: 'Next Tuesday, the volunteers [will] [clean] the muddy riverbank near our school.', ask: 'What will the volunteers do?', h: 'Will is a helper. What will the volunteers do?', ex: 'Will helps clean. The verb team: will clean.', notes: { muddy: 'Muddy describes the riverbank. It is not a verb.', volunteers: 'Volunteers are people (a noun).', near: 'Near starts the words that tell where. It is not a verb.' } },
  { id: 'v30', sk: 'team', s: 'This week I [am] [building] a model volcano for the science fair.', ask: 'What am I doing?', h: 'Ask: What am I doing? Find the helper and the main verb.', ex: 'Am helps building. The verb team: am building.', notes: { model: 'Here model is a thing (a model volcano). It is not a verb.', volcano: 'Volcano is a thing (a noun).', fair: 'Fair is a thing (an event).' } },
  { id: 'v31', sk: 'team', s: 'The volunteers [were] [sorting] canned food at the community pantry.', ask: 'What were the volunteers doing?', h: 'Ask: What were the volunteers doing? Careful with the other -ed word.', ex: 'Were helps sorting. The verb team: were sorting. Canned describes the food.', notes: { canned: 'Canned describes the food. It has -ed, but it is not a verb here.', pantry: 'Pantry is a place (a noun).', food: 'Food is a thing (a noun).' } },
  { id: 'v32', sk: 'team', s: 'My older sister [is] [practicing] her lines for the school play.', ask: 'What is my older sister doing?', h: 'Ask: What is my sister doing? Play is at the end, but is it an action here?', ex: 'Is helps practicing. The verb team: is practicing.', notes: { play: 'Here play is a show on a stage (a thing), so it is a noun, not a verb.', lines: 'Here lines are words in the play, so it is a noun.', older: 'Older describes my sister. It is not a verb.' } },
  { id: 'v33', sk: 'team', s: 'The scientists [have] [discovered] a new kind of frog in the rainforest.', ask: 'What have the scientists done?', h: 'Have is a helper here. Which -ed word does it help?', ex: 'Have helps discovered. The verb team: have discovered.', notes: { kind: 'Here kind means a type of frog, so it is a noun.', frog: 'Frog is an animal (a noun).', new: 'New describes the kind of frog. It is not a verb.' } },
  { id: 'v34', sk: 'team', s: 'By lunchtime, the busy ants [had] [carried] every crumb back to their hill.', ask: 'What had the ants done?', h: 'Had is a helper here. What had the ants done?', ex: 'Had helps carried. The verb team: had carried.', notes: { busy: 'Busy describes the ants. It is not a verb.', crumb: 'Crumb is a thing (a noun).', back: 'Back tells where. It is not a verb.' } },
  { id: 'v35', sk: 'team', s: 'Hikers [should] [carry] plenty of water on hot summer days.', ask: 'What should hikers do?', h: 'Should is a helper. What should hikers do?', ex: 'Should helps carry. The verb team: should carry.', notes: { water: 'Here water is a thing hikers carry, so it is a noun.', hot: 'Hot describes the days. It is not a verb.', plenty: 'Plenty tells how much. It is not a verb.' } },
  { id: 'v36', sk: 'team', s: 'With all this wind, the old oak tree [might] [lose] a heavy branch tonight.', ask: 'What might the oak tree do?', h: 'Might is a helper. What might the tree do?', ex: 'Might helps lose. The verb team: might lose.', notes: { wind: 'Wind is a thing here (all this wind). It is a noun.', heavy: 'Heavy describes the branch. It is not a verb.', tonight: 'Tonight tells when. It is not a verb.' } },
  { id: 'v37', sk: 'team', s: 'From the top of the lighthouse, we [could] [see] tiny sailboats on the bay.', ask: 'What could we do?', h: 'Could is a helper. What could we do from the lighthouse?', ex: 'Could helps see. The verb team: could see.', notes: { tiny: 'Tiny describes the sailboats. It is not a verb.', top: 'Top is a place on the lighthouse (a noun).', sailboats: 'Sailboats are things (nouns).' } },
  { id: 'v38', sk: 'team', s: 'Our mail carrier [did] [deliver] the package before the big snowstorm.', ask: 'What did the mail carrier do?', h: 'Did can help another verb. Look right after it.', ex: 'Did helps deliver. The verb team: did deliver.', notes: { package: 'Package is a thing (a noun).', snowstorm: 'Snowstorm is a thing (an event).', big: 'Big describes the snowstorm. It is not a verb.' } },
  { id: 'v39', sk: 'team', s: 'Visitors [must] [stay] on the wooden path inside the nature center.', ask: 'What must visitors do?', h: 'Must is a helper. What must visitors do?', ex: 'Must helps stay. The verb team: must stay.', notes: { wooden: 'Wooden describes the path. It is not a verb.', path: 'Path is a place (a noun).', inside: 'Inside starts the words that tell where. It is not a verb.' } },
  { id: 'v40', sk: 'team', s: 'My grandmother [would] [enjoy] a quiet afternoon at the art museum.', ask: 'What would my grandmother do?', h: 'Would is a helper. Which verb does it help?', ex: 'Would helps enjoy. The verb team: would enjoy.', notes: { quiet: 'Quiet describes the afternoon. It is not a verb.', afternoon: 'Afternoon is a time (a noun).', museum: 'Museum is a place (a noun).' } },
  { id: 'v41', sk: 'team', s: 'Each student [may] [keep] one smooth rock from the classroom collection.', ask: 'What may each student do?', h: 'May is a helper. What may each student do?', ex: 'May helps keep. The verb team: may keep.', notes: { smooth: 'Smooth describes the rock. It is not a verb.', rock: 'Here rock is a stone (a thing), so it is a noun.', collection: 'Collection is a thing (a noun).' } },
  { id: 'v42', sk: 'team', s: 'Tomorrow we [shall] [read] a poem about the ocean at the class assembly.', ask: 'What shall we do?', h: 'Shall is a helper. What shall we do tomorrow?', ex: 'Shall helps read. The verb team: shall read.', notes: { tomorrow: 'Tomorrow tells when. It is not a verb.', poem: 'Poem is a thing (a noun).', assembly: 'Assembly is a thing (an event).' } },
  { id: 'v43', sk: 'team', s: 'Our class turtle [does] [eat] fresh lettuce, but only in the morning.', ask: 'What does the turtle do?', h: 'Does can help another verb. Look right after it.', ex: 'Does helps eat. The verb team: does eat.', notes: { fresh: 'Fresh describes the lettuce. It is not a verb.', lettuce: 'Lettuce is a thing (a noun).', only: 'Only is not a verb. It just limits when the turtle eats.' } },

  // Three-word verb teams
  { id: 'v44', sk: 'long', s: 'The honeybees [have] [been] [collecting] sweet nectar from the clover all morning.', ask: 'What have the honeybees been doing?', h: 'This team has two helpers and one main verb. Keep going until the -ing word.', ex: 'Have and been are helpers. Collecting is the main verb. The whole team: have been collecting.', notes: { sweet: 'Sweet describes the nectar. It is not a verb.', nectar: 'Nectar is a thing (a noun).', morning: 'Morning tells when. It is a noun.' } },
  { id: 'v45', sk: 'long', s: 'Next week, our class [will] [be] [visiting] the big aquarium downtown.', ask: 'What will our class be doing?', h: 'Find two helpers and one main verb.', ex: 'Will and be are helpers. Visiting is the main verb. The whole team: will be visiting.', notes: { aquarium: 'Aquarium is a place (a noun).', downtown: 'Downtown tells where. It is not a verb.', week: 'Week is a time (a noun).' } },
  { id: 'v46', sk: 'long', s: 'The baker [had] [been] [kneading] soft dough for an hour before sunrise.', ask: 'What had the baker been doing?', h: 'Start at had. Keep going until you reach the main verb.', ex: 'Had and been help kneading. The whole team: had been kneading.', notes: { dough: 'Dough is a thing (a noun).', soft: 'Soft describes the dough. It is not a verb.', sunrise: 'Sunrise is a time (a noun).' } },
  { id: 'v47', sk: 'long', s: 'We [should] [have] [brought] our raincoats on the soggy field trip.', ask: 'What should we have done?', h: 'Brought is the past form of bring. Which two helpers come before it?', ex: 'Should and have help brought. The whole team: should have brought.', notes: { raincoats: 'Raincoats are things (nouns).', soggy: 'Soggy describes the field trip. It is not a verb.', trip: 'Trip is a thing (an event).' } },
  { id: 'v48', sk: 'long', s: 'By early summer, the caterpillars [will] [have] [become] beautiful butterflies.', ask: 'What will the caterpillars have done?', h: 'Find two helpers before the main verb become.', ex: 'Will and have help become. The whole team: will have become.', notes: { beautiful: 'Beautiful describes the butterflies. It is not a verb.', butterflies: 'Butterflies are animals (a noun).', early: 'Early tells which part of summer. It is not a verb.' } },
  { id: 'v49', sk: 'long', s: 'The squirrels [might] [have] [buried] their acorns under the maple tree.', ask: 'What might the squirrels have done?', h: 'Might starts the team. Keep going until you reach the -ed main verb.', ex: 'Might and have help buried. The whole team: might have buried.', notes: { acorns: 'Acorns are things (nouns).', maple: 'Maple tells what kind of tree. It is not a verb.', under: 'Under starts the words that tell where. It is not a verb.' } },

  // Ending clues
  { id: 'v50', sk: 'endings', s: 'By Sunday afternoon, the melting snowman [was] tiny and lopsided.', h: 'Careful! Does melting tell what someone is doing, or does it describe the snowman?', ex: 'Was is the verb. Melting describes the snowman, so it is not a verb here. There is no helper before it.', notes: { melting: 'Here melting describes the snowman (which snowman? the melting one). It is not a verb in this sentence.', tiny: 'Tiny describes the snowman. It is not a verb.', lopsided: 'Lopsided describes the snowman. It is not a verb.' } },
  { id: 'v51', sk: 'endings', s: 'The frightened kitten [hid] under the porch during the thunderstorm.', ask: 'What did the kitten do?', h: 'One word ends in -ed, but it describes the kitten. Hide changes to a new word in the past.', ex: 'Hid is the past form of hide, so it is the verb. Frightened describes the kitten.', notes: { frightened: 'Frightened describes the kitten (what kind of kitten?). The -ed ending does not make it a verb here.', thunderstorm: 'Thunderstorm is a thing (an event).', under: 'Under starts the words that tell where. It is not a verb.' } },
  { id: 'v52', sk: 'endings', s: 'In the kitchen, the whistling teakettle [startled] my baby brother.', ask: 'What did the teakettle do?', h: 'Two words have endings. Which one describes the teakettle, and which one tells what it did?', ex: 'Startled is the verb. Whistling describes the teakettle, so it is not a verb here.', notes: { whistling: 'Here whistling describes the teakettle. It is not a verb in this sentence.', baby: 'Baby describes which brother. It is not a verb.', kitchen: 'Kitchen is a place (a noun).' } },
  { id: 'v53', sk: 'endings', s: 'The cracked eggshells [were] on the counter next to the mixing bowl.', h: 'Cracked and mixing both have endings. Do they describe things, or show actions?', ex: 'Were is the verb. Cracked describes the eggshells, and mixing describes the bowl.', notes: { cracked: 'Cracked describes the eggshells. The -ed ending does not make it a verb here.', mixing: 'Mixing tells what kind of bowl. It is not a verb in this sentence.', counter: 'Counter is a thing (a noun).' } },
  { id: 'v54', sk: 'endings', s: 'Yesterday, Imani [baked] warm cornbread for the hungry volunteers at the shelter.', ask: 'What did Imani do?', h: 'Look for an -ed ending. Does that word show what Imani did?', ex: 'Baked tells what Imani did. The -ed ending shows it happened in the past.', notes: { hungry: 'Hungry describes the volunteers. It is not a verb.', warm: 'Warm describes the cornbread. It is not a verb.', yesterday: 'Yesterday tells when. It is not a verb.' } },

  // Challenge: words in between (optional)
  { id: 'v55', sk: 'challenge', s: 'Today the brown bear at the zoo [is] not [sleeping] in its cave.', ask: 'What is the bear not doing?', h: 'Not sits between the verb words. Leave not out.', ex: 'Is and sleeping are the verb words. Not is not a verb.', notes: { not: 'Not is NOT a verb. It changes the meaning, but leave it out of the verb team.', today: 'Today tells when. It is not a verb.', cave: 'Cave is a place (a noun).' } },
  { id: 'v56', sk: 'challenge', s: 'With her long net, Priya [can] easily [catch] the fluttering butterflies.', ask: 'What can Priya do?', h: 'A how word sneaks between the helper and the main verb. Skip it.', ex: 'Can and catch are the verb words. Easily tells how. Fluttering describes the butterflies.', notes: { easily: 'Easily tells HOW she catches. It is an adverb, not a verb.', fluttering: 'Here fluttering describes the butterflies. It is not a verb in this sentence.', net: 'Net is a thing (a noun).' } },
  { id: 'v57', sk: 'challenge', s: 'The scientists [have] finally [finished] their report about the coral reef.', ask: 'What have the scientists done?', h: 'A word that tells when sits inside the verb team. Skip it.', ex: 'Have and finished are the verb words. Finally tells when. It is not a verb.', notes: { finally: 'Finally tells WHEN. It is an adverb, not a verb.', report: 'Here report is a thing they wrote, so it is a noun.', coral: 'Coral tells what kind of reef. It is not a verb.' } },
  { id: 'v58', sk: 'challenge', s: '[Do] the penguins at the aquarium [eat] fresh fish every day?', ask: 'What do the penguins do?', h: 'In a question, the helper can come first. Then find the main verb after the penguins.', ex: 'Do and eat are the verb words. In a question, the helper moves to the front.', notes: { penguins: 'Penguins are animals (a noun). They sit between the verb words.', fish: 'Here fish is the food, so it is a noun, not a verb.', fresh: 'Fresh describes the fish. It is not a verb.' } },
  { id: 'v59', sk: 'challenge', s: 'My grandmother [has] never [seen] a real volcano in Hawaii.', ask: 'What has my grandmother never done?', h: 'Find the helper and the main verb. Skip the word between them.', ex: 'Has and seen are the verb words. Never is not a verb.', notes: { never: 'Never is NOT a verb. Leave it out of the verb team.', real: 'Real describes the volcano. It is not a verb.', volcano: 'Volcano is a thing (a noun).' } }
];

/* Helper-word memory questions (multiple choice) */
var HELPER_MC = [
  { id: 'h1', sk: 'helpers', q: 'Finish the BE family: am, is, are, was, ___', c: ['were', 'has', 'do'], a: 0, h: 'Think: they ___ happy yesterday. Which BE word fits?', ex: 'am, is, are, was, WERE, be, being, been.' },
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
  { id: 'n1', sk: 'multi', s: '[Omar:pP] packed a [telescope:t] and a [blanket:t] for the [trip:t] to the [planetarium:l].', h: 'Look for five nouns: one person, three things, and one place.', ex: 'Omar is a person. Telescope, blanket, and trip are things (a trip is an event). Planetarium is a place.', notes: { packed: 'Packed is the action word, a verb. It is not a noun.' } },
  { id: 'n2', sk: 'multi', s: 'After [lunch:t], the [volunteers:p] planted [tomatoes:t] and [peppers:t] beside the [gym:l].', h: 'Find the people, what they planted, where they planted, and the meal that came first.', ex: 'Lunch is a thing (a meal). Volunteers are people. Tomatoes and peppers are things. Gym is a place.', notes: { after: 'After tells when. It is not a noun. Look at the word right after it.', beside: 'Beside tells where. The noun is the place after it.' } },
  { id: 'n3', sk: 'multi', s: '[Imani:pP] and her [cousin:p] built a [scarecrow:t] with old [clothes:t] and [straw:t].', h: 'Two people built something. What did they build, and what did they use?', ex: 'Imani and cousin are people. Scarecrow, clothes, and straw are things.', notes: { her: 'Her tells whose cousin. It is not a noun here.', old: 'Old describes the clothes. It is an adjective, not a noun.' } },
  { id: 'n4', sk: 'multi', s: 'Our [class:p] watched a [caterpillar:t] turn into a [butterfly:t] inside a clear [jar:t].', h: 'A group of people watched. What changed, and where was it kept?', ex: 'Class names a group of people. Caterpillar and butterfly are animals, so they are things. Jar is a thing.', notes: { our: 'Our tells whose class. It is not a noun here.', clear: 'Clear describes the jar. It is an adjective.' } },
  { id: 'n5', sk: 'multi', s: 'During the [storm:t], the [farmer:p] led his [horses:t] into the [barn:l].', h: 'Find the weather event, the person, the animals, and the place.', ex: 'Storm is a thing (an event). Farmer is a person. Horses are animals. Barn is a place.', notes: { his: 'His tells whose horses. It is not a noun here.' } },
  { id: 'n6', sk: 'multi', s: 'The [crowd:p] clapped as the [runner:p] carried the [flag:t] around the [track:l].', h: 'One noun names a whole group of people. Find it and three more nouns.', ex: 'Crowd is a group of people. Runner is a person. Flag is a thing. Track is a place.', notes: { clapped: 'Clapped is the action word, a verb.', carried: 'Carried is the action word, a verb.' } },
  { id: 'n7', sk: 'multi', s: 'A [flock:t] of [geese:t] landed on the [pond:l] behind our [school:l].', h: 'One noun names a group of birds. Then find the birds and two places.', ex: 'Flock names a group of animals. Geese are animals. Pond and school are places.', notes: { our: 'Our tells whose school. It is not a noun here.', behind: 'Behind tells where. The noun is the place after it.' } },
  { id: 'n8', sk: 'things', s: 'A [beaver:t] chewed through a [log:t] and dragged [branches:t] into the [water:t].', h: 'Find the animal and the three things it used or moved.', ex: 'Beaver names an animal, a living thing. Log, branches, and water are things.', notes: { chewed: 'Chewed is the action, a verb.', dragged: 'Dragged is the action, a verb.' } },
  { id: 'n9', sk: 'places', s: 'The [scouts:p] set up their [tents:t] near a [lake:l] in the [mountains:l].', want: 'l', h: 'Ask: where did the scouts camp? There are two places.', ex: 'Lake and mountains name places. Scouts are people and tents are things.', notes: { their: 'Their tells whose tents. It is not a noun.' } },
  { id: 'n10', sk: 'people', s: 'The [pilot:p] waved to the [passengers:p] before the [plane:t] left the [airport:l].', want: 'p', h: 'Who waved, and who did they wave to?', ex: 'Pilot and passengers name people. Plane is a thing and airport is a place.' },
  { id: 'n11', sk: 'things', s: 'At the [aquarium:l], my [brother:p] took a [picture:t] of a [stingray:t].', want: 't', h: 'What did my brother take? What animal was in it?', ex: 'Picture is a thing. Stingray is an animal, so it is a thing too. Brother is a person and aquarium is a place.', notes: { my: 'My tells whose brother. It is not a noun.' } },
  { id: 'n12', sk: 'places', s: '[Malik:pP] rode his [bike:t] past the [bakery:l] and stopped at the [pharmacy:l].', want: 'l', h: 'Ask: what did Malik ride past, and where did he stop?', ex: 'Bakery and pharmacy name places. Malik is a person and bike is a thing.', notes: { his: 'His tells whose bike. It is not a noun.' } },
  { id: 'n13', sk: 'people', s: 'The [veterinarian:p] gently checked the [kitten:t] while its [owner:p] waited.', want: 'p', h: 'Who did the checking, and who waited?', ex: 'Veterinarian and owner name people. Kitten is an animal, a thing.', notes: { gently: 'Gently tells how. It is an adverb, not a noun.', its: 'Its tells whose owner. It is not a noun.' } },
  { id: 'n14', sk: 'places', s: 'My [aunt:p] works at a [hospital:l] near the [harbor:l] in a busy [city:l].', want: 'l', h: 'Ask: where does my aunt work? Keep going: there are three places.', ex: 'Hospital, harbor, and city all name places. Aunt is a person.', notes: { busy: 'Busy describes the city. It is an adjective.', my: 'My tells whose aunt. It is not a noun.' } },
  { id: 'n15', sk: 'people', s: 'Our [principal:p] gave [awards:t] to the [students:p] at the [assembly:t].', want: 'p', h: 'Who gave something, and who got it?', ex: 'Principal and students name people. Awards are things. An assembly is an event, so it is a thing.', notes: { our: 'Our tells whose principal. It is not a noun.' } },
  { id: 'n16', sk: 'things', s: 'The [librarian:p] stacked the new [dictionaries:t] on a [cart:t] by the [window:t].', want: 't', h: 'What did the librarian stack? Where did she put them? Look for three things.', ex: 'Dictionaries, cart, and window are things. Librarian is a person.', notes: { new: 'New describes the dictionaries. It is an adjective.' } },
  { id: 'n17', sk: 'proper', s: '[Kenji:pP] and his [grandmother:p] rode a [train:t] to [Savannah:lP] to see the [ocean:l].', want: 'P', h: 'Look for a special name for a person and a special name for a city.', ex: 'Kenji names one special boy. Savannah names one special city in Georgia. Grandmother, train, and ocean are common nouns.', notes: { his: 'His tells whose grandmother. It is not a noun.' } },
  { id: 'n18', sk: 'proper', s: 'Our [parrot:t] [Mango:tP] whistles a [song:t] whenever the [doorbell:t] rings.', want: 'P', h: 'What is the parrot’s special name?', ex: 'Mango is the name of one special parrot, so it is a proper noun. Parrot, song, and doorbell are common nouns.', notes: { our: 'Our tells whose parrot. It is not a noun.' } },
  { id: 'n19', sk: 'proper', s: 'On [Juneteenth:tP], [Aaliyah:pP] marched in a [parade:t] with her [grandparents:p].', want: 'c', h: 'Common nouns do not start with a capital letter unless they begin the sentence.', ex: 'Parade and grandparents are common nouns. Juneteenth is the name of a special holiday, and Aaliyah is a name, so they are proper nouns.', notes: { her: 'Her tells whose grandparents. It is not a noun.' } },
  { id: 'n20', sk: 'proper', s: 'On [Thanksgiving:tP], [Jamal:pP] traveled with his [family:p] from [Macon:lP] to [Augusta:lP].', want: 'P', h: 'Look for a holiday, a boy’s name, and two cities. They all start with capital letters.', ex: 'Thanksgiving, Jamal, Macon, and Augusta are special names, so they are proper nouns. Family is a common noun.', notes: { his: 'His tells whose family. It is not a noun.' } },
  { id: 'n21', sk: 'ideas', s: '[Curiosity:i] led the young [scientist:p] to study [bugs:t] in her [backyard:l].', want: 'i', h: 'Which noun names a feeling of wanting to know more?', ex: 'Curiosity names an idea. You cannot touch it, but it is a noun. Scientist is a person, bugs are things, and backyard is a place.', notes: { young: 'Young describes the scientist. It is an adjective.', her: 'Her tells whose backyard. It is not a noun.' } },
  { id: 'n22', sk: 'ideas', s: '[Amara:pP] showed great [patience:i] while her little [brother:p] built a [tower:t] of [blocks:t].', want: 'i', h: 'What did Amara show? You cannot see it or hold it.', ex: 'Patience names an idea. Amara and brother are people. Tower and blocks are things.', notes: { great: 'Great describes patience. It is an adjective.', little: 'Little describes brother. It is an adjective.', her: 'Her tells whose brother. It is not a noun.' } },
  { id: 'n23', sk: 'ideas', s: 'The [students:p] read [stories:t] about [freedom:i] and [friendship:i] in the [library:l].', want: 'i', h: 'What were the stories about? Look for two ideas.', ex: 'Freedom and friendship name ideas. Students are people, stories are things, and library is a place.' },
  { id: 'n24', sk: 'multi', s: 'The [museum:l] has a [skeleton:t] of a [dinosaur:t] and a [map:t] of the [ocean:l].', h: 'There are five nouns. Check the words after each the and a.', ex: 'Museum and ocean are places. Skeleton and map are things. Dinosaur is an animal, so it is a thing.', notes: { has: 'Has is the verb. It is not a noun.' } },
{ id: 'n25', sk: 'people', s: 'The [firefighter:p] rescued a [kitten:t] from the tall [tree:t].', want: 'p', h: 'Who did the rescuing?', h2: 'A person noun names someone who can do things. Kitten is an animal and tree is a thing.', ex: 'Firefighter names a person. Kitten and tree are nouns too, but they are not people.', notes: { tall: 'Tall describes the tree. It is an adjective.' } },
  { id: 'n26', sk: 'people', s: 'After the [concert:t], the proud [drummer:p] bowed on the [stage:l].', want: 'p', h: 'Who bowed?', h2: 'Ask "who?" Only one noun names someone who plays music.', ex: 'Drummer names a person. Concert is an event (a thing) and stage is a place.', notes: { proud: 'Proud describes the drummer. It is an adjective.' } },
  { id: 'n27', sk: 'places', s: 'Our [class:p] took a [trip:t] to the [museum:l] downtown.', want: 'l', h: 'Where did the class go?', h2: 'A place noun names somewhere you can go or be. Look after the word "to."', ex: 'Museum names a place. Class is a group of people, and trip is a thing (an event).' },
  { id: 'n28', sk: 'places', s: 'The [ducks:t] swam slowly across the [pond:l].', want: 'l', h: 'Where did the ducks swim?', h2: 'Ask "where?" The answer is a place you could point to on a map of a park.', ex: 'Pond names a place. Ducks are animals, which count as things.' },
  { id: 'n29', sk: 'things', s: 'My [grandmother:p] knitted a warm [scarf:t] in the [kitchen:l].', want: 't', h: 'What did Grandmother make?', h2: 'A thing noun names an object you can touch. Grandmother is a person and kitchen is a place.', ex: 'Scarf names a thing.', notes: { warm: 'Warm describes the scarf. It is an adjective.' } },
  { id: 'n30', sk: 'things', s: 'At the [market:l], [Dad:pP] bought fresh [peaches:t].', want: 't', h: 'What did Dad buy?', h2: 'Look for the object Dad bought. Market is where he was.', ex: 'Peaches names things. Market is a place and Dad is a person.', notes: { fresh: 'Fresh describes the peaches. It is an adjective.' } },
  { id: 'n31', sk: 'ideas', s: '[Bravery:i] helped the young [swimmer:p] cross the [lake:l].', want: 'i', h: 'Which noun can you not see or touch?', h2: 'An idea noun names a feeling or quality, like courage or joy. Swimmer and lake can be seen.', ex: 'Bravery names an idea. Swimmer is a person and lake is a place.' },
  { id: 'n32', sk: 'ideas', s: 'The [students:p] felt great [excitement:i] before the [parade:t].', want: 'i', h: 'Which noun names a feeling?', h2: 'Find the word that names what the students felt inside.', ex: 'Excitement names a feeling, which is an idea. Students are people and the parade is an event.', notes: { great: 'Great describes the excitement. It is an adjective.' } }
];

/* ───────────────────────── ADJECTIVE BANK ───────────────────────── */
var ADJ_BANK = [
  { id: 'a1', sk: 'kind', s: 'At the zoo, a [shy@panda] panda chewed on [green@bamboo] bamboo behind the rocks.', h: 'Find the panda and the bamboo. What kind of panda? What kind of bamboo?', ex: 'Shy describes panda. Green describes bamboo. Both tell what kind.' },
  { id: 'a2', sk: 'kind', s: 'Before the [fierce@storm] storm, Grandpa stacked [dry@firewood] firewood beside the shed.', h: 'What kind of storm was coming? What kind of firewood did Grandpa stack?', ex: 'Fierce describes storm. Dry describes firewood.' },
  { id: 'a3', sk: 'many', s: '[Twelve@volunteers] volunteers picked up trash along the beach on Saturday.', h: 'How many volunteers helped?', ex: 'Twelve describes volunteers. It tells how many.' },
  { id: 'a4', sk: 'kind', s: 'Ayesha wore a [purple@scarf] scarf and [warm@mittens] mittens to the parade.', h: 'Ayesha wore two things. What kind was each one?', ex: 'Purple describes scarf. Warm describes mittens.' },
  { id: 'a5', sk: 'kind', s: 'The [curious@scientists] scientists studied a [strange@rock] rock from the bottom of the ocean.', h: 'What kind of scientists? What kind of rock?', ex: 'Curious describes scientists. Strange describes rock.', notes: { bottom: 'Bottom is a noun here: the bottom of the ocean. It does not describe another noun.' } },
  { id: 'a6', sk: 'many', s: 'The librarian found [several@books] books about volcanoes behind her desk.', h: 'How many books did the librarian find?', ex: 'Several describes books. It tells how many, but not an exact number.' },
  { id: 'a7', sk: 'kind', s: 'Our class planted [tiny@seeds] seeds in [soft@soil] soil for an experiment.', h: 'What kind of seeds? What kind of soil?', ex: 'Tiny describes seeds. Soft describes soil.' },
  { id: 'a8', sk: 'kind', s: 'A [gentle@breeze] breeze carried the [colorful@kite] kite above the treetops.', h: 'What kind of breeze? What kind of kite?', ex: 'Gentle describes breeze. Colorful describes kite.' },
  { id: 'a9', sk: 'many', s: 'Nia spotted a [few@ladybugs] ladybugs on the rosebush by the gate.', h: 'How many ladybugs did Nia spot? Look right before the noun.', ex: 'Few describes ladybugs. It tells how many: not a lot.' },
  { id: 'a10', sk: 'kind', s: 'Tariq found a [smooth@stone] stone with [white@stripes] stripes along the riverbank.', h: 'What kind of stone? What kind of stripes?', ex: 'Smooth describes stone. White describes stripes.' },
  { id: 'a11', sk: 'kind', s: 'During the picnic, the band played [cheerful@music] music under a [bright@moon] moon.', h: 'What kind of music? What kind of moon?', ex: 'Cheerful describes music. Bright describes moon.' },
  { id: 'a12', sk: 'kind', s: 'The [brave@astronaut] astronaut floated inside the [quiet@spaceship] spaceship as it circled Earth.', h: 'What kind of astronaut? What kind of spaceship?', ex: 'Brave describes astronaut. Quiet describes spaceship.', notes: { floated: 'Floated is a verb. It tells what the astronaut did.' } },
  { id: 'a13', sk: 'which', s: 'Darnell read the [last@chapter] chapter of his book before bed.', h: 'Which chapter did Darnell read?', ex: 'Last describes chapter. It tells which one.' },
  { id: 'a14', sk: 'which', s: 'The [first@snowflakes] snowflakes of winter landed on the windows of our classroom.', h: 'Which snowflakes landed?', ex: 'First describes snowflakes. It tells which ones.' },
  { id: 'a15', sk: 'multi', s: 'The [hungry@bear] bear searched the [tall@grass] grass for [sweet@berries] berries.', h: 'There are three nouns: bear, grass, and berries. Each one has a describing word.', ex: 'Hungry describes bear. Tall describes grass. Sweet describes berries.' },
  { id: 'a16', sk: 'multi', s: '[Three@musicians] musicians played [loud@drums] drums during the [final@game] game of the season.', h: 'How many musicians? What kind of drums? Which game?', ex: 'Three describes musicians (how many). Loud describes drums (what kind). Final describes game (which one).' },
  { id: 'a17', sk: 'multi', s: 'The [new@student] student shared [many@pictures] pictures of her [old@neighborhood] neighborhood.', h: 'Check the student, the pictures, and the neighborhood.', ex: 'New describes student. Many describes pictures (how many). Old describes neighborhood.' },
  { id: 'a18', sk: 'after', s: 'After the [long@hike] hike through the woods, our boots were [muddy@boots].', h: 'Find the noun hike. Then find the noun boots. One describing word comes after were.', ex: 'Long describes hike. Muddy describes boots. An adjective can come after a being verb like were.' },
  { id: 'a19', sk: 'after', s: 'At the cafe, the soup tasted [salty@soup] and the bread was [warm@bread].', h: 'How did the soup taste? What was the bread like?', ex: 'Salty describes soup. Warm describes bread. Both come after the verb.', notes: { tasted: 'Tasted is the verb. The word after it describes the soup.' } },
  { id: 'a20', sk: 'after', s: 'Inside the cave, the air felt [damp@air] and [chilly@air] against our skin.', h: 'Find the noun air. How did it feel? There are two describing words.', ex: 'Damp and chilly both describe air.', notes: { felt: 'Felt is the verb. The words after it describe the air.' } },
  { id: 'a21', sk: 'after', s: 'The puppies seemed [sleepy@puppies] after their [busy@day] day at the park.', h: 'How did the puppies seem? What kind of day did they have?', ex: 'Sleepy describes puppies. It comes after seemed. Busy describes day.' },
  { id: 'a22', sk: 'after', s: 'From the boat, the lighthouse looked [small@lighthouse] against the [gray@sky] sky.', h: 'Find the noun lighthouse. How did it look? What kind of sky?', ex: 'Small describes lighthouse. It comes after looked. Gray describes sky.' },
{ id: 'a23', sk: 'many', s: '[Nine@kittens] kittens slept in a [cozy@basket] basket.', h: 'How many kittens? What kind of basket?', h2: 'A number word before a noun tells how many. Then check the other noun for a describing word.', ex: 'Nine tells how many kittens. Cozy tells what kind of basket.' },
  { id: 'a24', sk: 'many', s: 'We counted [many@stars] stars in the [dark@sky] sky.', h: 'How many stars? What kind of sky?', h2: 'Many can tell how many, even without a number.', ex: 'Many tells how many stars. Dark tells what kind of sky.' },
  { id: 'a25', sk: 'which', s: 'The [last@bus] bus leaves the school at noon.', h: 'Which bus?', h2: 'Words like first, last, and next tell WHICH one.', ex: 'Last tells which bus.' },
  { id: 'a26', sk: 'which', s: 'Marcus won the [second@race] race on Friday.', h: 'Which race?', h2: 'Order words like first and second tell which one.', ex: 'Second tells which race.' },
  { id: 'a27', sk: 'which', s: 'Our class read the [final@page] page together.', h: 'Which page?', h2: 'Ask: which page did they read together?', ex: 'Final tells which page.' },
  { id: 'a28', sk: 'multi', s: 'The [tiny@frog] frog sat on a [wide@leaf] leaf.', h: 'Check both nouns: frog and leaf.', h2: 'Each noun has its own describing word right before it.', ex: 'Tiny describes frog. Wide describes leaf.' },
  { id: 'a29', sk: 'multi', s: '[Two@squirrels] squirrels chased [round@acorns] acorns across the yard.', h: 'How many squirrels? What kind of acorns?', h2: 'There is one describing word before each animal or thing.', ex: 'Two tells how many squirrels. Round tells what kind of acorns.' }
];

/* ───────────────────────── ADVERB BANK ───────────────────────── */
var ADV_BANK = [
  { id: 'd1', sk: 'how', s: 'During the spelling bee on Friday, Maya spelled every word [correctly@spelled:how].', h: 'Find the verb spelled. How did Maya spell?', ex: 'Correctly tells HOW Maya spelled the words.' },
  { id: 'd2', sk: 'how', s: 'The firefighters climbed the ladder [carefully@climbed:how] to rescue the kitten.', h: 'How did the firefighters climb?', ex: 'Carefully tells HOW the firefighters climbed.' },
  { id: 'd3', sk: 'how', s: 'Our team worked [hard@worked:how] on the poster for the history fair.', h: 'How did the team work? This adverb does not end in -ly.', ex: 'Hard tells HOW the team worked. It has no -ly, but it describes the verb worked.' },
  { id: 'd4', sk: 'how', s: 'The cheetah ran [fast@ran:how] across the dry grass toward the herd.', h: 'How did the cheetah run?', ex: 'Fast tells HOW the cheetah ran.', notes: { dry: 'Dry describes the grass, a noun. It is an adjective.' } },
  { id: 'd5', sk: 'how', s: 'Andre played the violin [well@played:how] at the spring concert in the gym.', h: 'How did Andre play the violin? Not every adverb ends in -ly.', ex: 'Well tells HOW Andre played.' },
  { id: 'd6', sk: 'how', s: 'The kittens drank their milk [quietly@drank:how] beside the warm stove.', h: 'How did the kittens drink?', ex: 'Quietly tells HOW the kittens drank.', notes: { warm: 'Warm describes the stove, a noun. It is an adjective.' } },
  { id: 'd7', sk: 'when', s: 'The museum opens [early@opens:when] on Saturdays for families with babies.', h: 'When does the museum open?', ex: 'Early tells WHEN the museum opens.' },
  { id: 'd8', sk: 'when', s: '[Tomorrow@travel:when], we will travel [north@travel:where] with our grandparents to see the mountains.', want: 'when', h: 'Two words describe travel. Which one tells WHEN?', ex: 'Tomorrow tells WHEN we will travel. North is an adverb too, but it tells WHERE.' },
  { id: 'd9', sk: 'when', s: 'The yellow bus arrived [late@arrived:when] because of the heavy snow on the roads.', h: 'When did the bus arrive?', ex: 'Late tells WHEN the bus arrived.', notes: { heavy: 'Heavy describes the snow, a noun. It is an adjective.', yellow: 'Yellow describes the bus, a noun. It is an adjective.' } },
  { id: 'd10', sk: 'when', s: 'The new library will open [soon@open:when] across from the park.', h: 'When will the library open?', ex: 'Soon tells WHEN the library will open.', notes: { new: 'New describes the library, a noun. It is an adjective.' } },
  { id: 'd11', sk: 'when', s: 'We learned about clouds and rain in our science class [today@learned:when].', h: 'When did we learn about clouds and rain?', ex: 'Today tells WHEN we learned.' },
  { id: 'd12', sk: 'when', s: 'Grandma will finish the scary story about the haunted barn [tonight@finish:when].', h: 'When will Grandma finish the story?', ex: 'Tonight tells WHEN Grandma will finish.', notes: { scary: 'Scary describes the story, a noun. It is an adjective.' } },
  { id: 'd13', sk: 'where', s: 'At recess, the third graders played [outside@played:where] near the swings.', h: 'Where did the third graders play?', ex: 'Outside tells WHERE the third graders played.' },
  { id: 'd14', sk: 'where', s: 'After the parade, the tired band members rested [nearby@rested:where] in the shade.', h: 'Where did the band members rest?', ex: 'Nearby tells WHERE they rested.', notes: { tired: 'Tired describes the band members, so it is an adjective.', shade: 'Shade is a thing (a noun).' } },
  { id: 'd15', sk: 'where', s: 'The hikers climbed [upward@climbed:where] toward the top of the mountain.', h: 'Which way did the hikers climb?', ex: 'Upward tells WHERE the hikers climbed.' },
  { id: 'd16', sk: 'where', s: 'The frightened rabbit hopped [away@hopped:where] from the hungry fox in the garden.', h: 'Where did the rabbit hop?', ex: 'Away tells WHERE the rabbit hopped.', notes: { frightened: 'Frightened describes the rabbit, a noun. It is an adjective.', hungry: 'Hungry describes the fox, a noun. It is an adjective.' } },
  { id: 'd17', sk: 'where', s: 'Dad searched [everywhere@searched:where] for the keys to the minivan before the trip.', h: 'Where did Dad search?', ex: 'Everywhere tells WHERE Dad searched.' },
  { id: 'd18', sk: 'where', s: 'As the thunder rumbled over the field, the soccer players hurried [inside@hurried:where].', h: 'Where did the players hurry?', ex: 'Inside tells WHERE the players hurried.' },
  { id: 'd19', sk: 'compare', s: 'The friendly crossing guard waved [cheerfully@waved:how] at the children on their way to school.', h: 'One -ly word describes the guard. One -ly word tells how the guard waved. Which one tells HOW?', ex: 'Cheerfully tells how the guard waved, so it is an adverb. Friendly describes the guard, a noun, so it is an adjective.', notes: { friendly: 'Friendly ends in -ly, but it describes the guard, a noun. That makes it an adjective.' } },
  { id: 'd20', sk: 'compare', s: 'The nervous goalie watched the ball [closely@watched:how] during the last minute of the game.', h: 'Find the verb watched. Which word tells how the goalie watched?', ex: 'Closely tells how the goalie watched, so it is an adverb. Nervous and last describe nouns, so they are adjectives.', notes: { nervous: 'Nervous describes the goalie, a noun. That makes it an adjective.', last: 'Last describes the minute, a noun. It is an adjective that tells which one.' } },
  { id: 'd21', sk: 'compare', k: 'mc', q: 'The lonely puppy waited by the window all afternoon.\nWhat does lonely describe?', c: ['puppy — so lonely is an adjective', 'waited — so lonely is an adverb'], a: 0, h: 'Ask: a lonely what? Does it tell how the puppy waited?', ex: 'Lonely describes the puppy, a noun. So lonely is an adjective, even though it ends in -ly.' },
  { id: 'd22', sk: 'compare', k: 'mc', q: 'Our neighbors planted a lovely garden in the spring.\nLovely ends in -ly. What is it?', c: ['an adverb, because it ends in -ly', 'an adjective, because it describes the garden'], a: 1, why: ['The -ly ending is only a clue. Ask what lovely describes.'], h: 'Ask: a lovely what?', ex: 'Lovely describes the garden, a noun. So it is an adjective, even though it ends in -ly.' },
  { id: 'd23', sk: 'compare', k: 'mc', q: 'The players worked hard before the big game.\nWhat does hard describe?', c: ['worked — so hard is an adverb', 'game — so hard is an adjective'], a: 0, h: 'Does hard tell how the players worked?', ex: 'Hard tells how the players worked. It describes the verb worked, so it is an adverb.' }
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
  { id: 'o13', sk: 'long', k: 'mc', q: 'Which word has a long u, like in cute?', c: ['cube', 'cub', 'cut'], a: 0, say: true, h: 'Which word ends with a silent e?', ex: 'Cube ends with silent e, so the u says its name.' },
  { id: 'o14', sk: 'silente', k: 'mc', q: 'cap → cape. What changed when we added e?', c: ['The a now says its name (long a).', 'The a now says a short sound.', 'The word lost a vowel.'], a: 0, say: true, h: 'Silent e often helps the vowel before it say its name.', ex: 'In cape, the silent e helps the a say its name: long a.' },
  { id: 'o15', sk: 'silente', k: 'mc', q: 'Which pair shows short vowel → long vowel with silent e?', c: ['hop → hope', 'hop → hip', 'hope → home'], a: 0, h: 'Look for a pair where the only change is an e added at the end.', ex: 'hop + e = hope. The o changes from short to long.' },
  { id: 'o16', sk: 'letters', k: 'mc', q: 'How many vowel letters are in the word tent?', c: ['1', '2', '3'], a: 0, h: 'The vowel letters are a, e, i, o, u. Check each letter in t-e-n-t.', ex: 'Tent has one vowel letter: e.' },
  { id: 'o17', sk: 'short', k: 'mc', q: 'Which word has a short i sound, like in pig?', c: ['fine', 'bike', 'fin'], a: 2, say: true, h: 'Find the word with no silent e.', ex: 'Fin has the short i pattern f-i-n. Fine and bike end with silent e.' },
  { id: 'o18', sk: 'short', k: 'mc', q: 'Which word has a short o sound, like in pot?', c: ['hot', 'hope', 'boat'], a: 0, say: true, h: 'Find the word with one vowel between two consonants.', ex: 'Hot has the short o pattern h-o-t.' },
  { id: 'o19', sk: 'short', k: 'mc', q: 'Which word has a short e sound, like in bed?', c: ['feet', 'these', 'pet'], a: 2, say: true, h: 'Find the word with one e between two consonants.', ex: 'Pet has the short e pattern p-e-t. Feet has ee and these has silent e: both long e.' },
  { id: 'o20', sk: 'teams', k: 'mc', q: 'Which word fits and has the vowel team ai?\n“We waited for the ___ to stop.”', c: ['ran', 'run', 'rain'], a: 2, h: 'Which word makes sense AND has a and i together?', ex: 'Rain makes sense and has the ai team.' },
  { id: 'o21', sk: 'teams', k: 'mc', q: 'Which word has a vowel team that says long o?', c: ['rod', 'road', 'rid'], a: 1, say: true, h: 'Look for o and a side by side.', ex: 'Road has the team oa, which says long o.' },
  { id: 'o22', sk: 'long', k: 'mc', q: 'Which word has long a spelled with a silent e?', c: ['rain', 'cap', 'cake'], a: 2, say: true, h: 'Two words may have long a, but only one uses silent e.', ex: 'Cake uses silent e. Rain has long a too, but it uses the team ai.', why: ['Rain has long a, but it is spelled with ai, not silent e.', 'Cap has a short a.'] },
  { id: 'o23', sk: 'letters', k: 'mc', q: 'Which letter in the word cup is a vowel?', c: ['c', 'u', 'p'], a: 1, h: 'The vowel letters are a, e, i, o, u.', ex: 'U is a vowel letter.' },
  { id: 'o24', sk: 'long', k: 'sort', q: 'Sort each word: short vowel or long vowel?', b: ['Short vowel', 'Long vowel'], items: [['bed', 0], ['seed', 1], ['pig', 0], ['kite', 1], ['cup', 0], ['cute', 1]], h: 'Long vowels in these words use silent e or a vowel team.', ex: 'bed, pig, cup are short (one vowel between consonants). seed (ee), kite (silent e), cute (silent e) are long.' },
{ id: 'o25', sk: 'letters', k: 'mc', q: 'Which word has the vowel letter o?', c: ['frog', 'fish', 'duck'], a: 0, h: 'Look at the middle of each word.', h2: 'Point to the vowel letter in each word and name it.', ex: 'Frog has the vowel letter o. Fish has i and duck has u.' },
  { id: 'o26', sk: 'letters', k: 'mc', q: 'How many vowel letters are in the word basket?', c: ['1', '2', '3'], a: 1, h: 'Check each letter: b-a-s-k-e-t.', h2: 'The vowel letters are a, e, i, o, u. Count each one you find.', ex: 'Basket has two vowel letters: a and e.' },
  { id: 'o27', sk: 'letters', k: 'mc', q: 'Which letter in the word drum is a vowel?', c: ['d', 'u', 'm'], a: 1, h: 'Say the vowel letters: a, e, i, o, u.', h2: 'Compare each letter in drum with that list.', ex: 'U is the vowel letter in drum.' },
  { id: 'o28', sk: 'long', k: 'mc', q: 'Which word has a long i sound, where the i says its name?', c: ['ride', 'rid', 'rod'], a: 0, say: true, h: 'Which word ends with a silent e?', h2: 'Silent e usually makes the vowel before it say its name.', ex: 'Ride ends with silent e, so the i says its name.' },
  { id: 'o29', sk: 'long', k: 'mc', q: 'Which word has a long o sound, where the o says its name?', c: ['not', 'nose', 'nut'], a: 1, say: true, h: 'Look for a silent e at the end.', h2: 'Silent e at the end usually makes the vowel before it say its name. Check each word for that pattern.', ex: 'Nose ends with silent e, so the o says its name.' }
];

/* ───────────────────────── READING PASSAGES (6) ───────────────────────── */
var PASSAGES = [
  {
    "id": "p1",
    "img": "reading",
    "title": "Teamwork on the Baseball Field",
    "type": "Nonfiction",
    "topic": "Baseball teamwork",
    "paras": [
      [
        "Baseball might look like a contest between one pitcher and one batter, but it is really a team sport.",
        "When a team is in the field, nine players work together to stop the other team from scoring runs.",
        "Each player has a position, which is a special place and job on the field.",
        "The pitcher throws the ball toward home plate, and the catcher crouches behind the plate to catch it.",
        "Four infielders play near the bases, while three outfielders cover the wide grass farther away."
      ],
      [
        "Sometimes a batter hits the ball deep into the outfield.",
        "The outfielder who chases it down may be too far away to throw it all the way to home plate.",
        "Instead, the outfielder throws the ball to an infielder who is waiting in between.",
        "That player catches it, turns, and quickly throws it the rest of the way.",
        "Passing the ball this way is called a relay, and it is usually faster than one long throw that bounces across the grass."
      ],
      [
        "Good teammates also communicate, which means they share information by talking or giving signals.",
        "When a high fly ball goes up between two players, one of them shouts, “I got it!”",
        "The other player hears the call and moves out of the way.",
        "Without that call, the two players might crash into each other and drop the ball.",
        "Catchers communicate too, because they use hand signals to tell the pitcher which pitch to throw."
      ],
      [
        "No single player can win a baseball game alone.",
        "When every player does a job, helps teammates, and speaks up, the whole team plays better."
      ]
    ],
    "qs": [
      {
        "id": "p1q1",
        "sk": "main",
        "q": "Which sentence BEST tells the main idea of this passage?",
        "c": [
          "Baseball players each do a job and work together to help their team.",
          "An outfielder can throw the ball to an infielder to make a relay.",
          "Catchers use hand signals to tell the pitcher what to throw.",
          "A baseball game is mostly a contest between the pitcher and the batter."
        ],
        "a": 0,
        "h": "Read the first sentence and the last paragraph. What idea do ALL the paragraphs support?",
        "h2": "Each paragraph shows a different way players help each other: playing positions, making relays, and calling for the ball. The main idea has to cover all of those, not just one paragraph.",
        "ex": "The passage says baseball is really a team sport. Every paragraph shows players doing their jobs, helping, and talking to each other, and the last paragraph says it again.",
        "why": [
          null,
          "This is true, but it only tells about the relay in the second paragraph. It is too small to be the main idea.",
          "This is true, but it is one detail from the third paragraph.",
          "The first sentence says baseball MIGHT look like that, but it is really a team sport."
        ]
      },
      {
        "id": "p1q2",
        "sk": "detail",
        "q": "According to the passage, why does a catcher use hand signals?",
        "c": [
          "To tell the infielders to get ready for a relay",
          "To tell the pitcher which pitch to throw",
          "To tell a teammate, “I got it!”",
          "To tell the outfielders where to stand"
        ],
        "a": 1,
        "h": "Find the word signals in the third paragraph and read that whole sentence.",
        "h2": "The sentence with signals names the catcher and one other player. Who is the catcher talking to, and about what?",
        "ex": "The passage says catchers “use hand signals to tell the pitcher which pitch to throw.”",
        "why": [
          "Relays are in the second paragraph. The passage does not say catchers signal for them.",
          null,
          "Players SHOUT “I got it!” for a fly ball. That is talking out loud, not a hand signal.",
          "The passage does not say the catcher tells outfielders where to stand."
        ]
      },
      {
        "id": "p1q3",
        "sk": "vocab",
        "q": "What does the word relay mean in this passage?",
        "c": [
          "One long throw that bounces across the grass",
          "Passing the ball to a teammate who throws it the rest of the way",
          "Shouting “I got it!” so a teammate moves out of the way",
          "Running fast to chase a ball deep in the outfield"
        ],
        "a": 1,
        "h": "Read the sentences in the second paragraph that come BEFORE “Passing the ball this way is called a relay.”",
        "h2": "The words “this way” point back to what the outfielder and the infielder just did with the ball. Picture the ball moving from one player to the next.",
        "ex": "The outfielder throws to an infielder, who catches it and throws it the rest of the way. Passing the ball this way is a relay.",
        "why": [
          "The passage says a relay is usually FASTER than one long throw, so they are not the same thing.",
          null,
          "Calling for the ball is in the third paragraph. It is how teammates communicate, not a relay.",
          "Chasing the ball happens before the relay starts. A relay is about throwing, not running."
        ]
      },
      {
        "id": "p1q4",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap the sentence that tells what could happen if two players did NOT call for the ball.",
        "ok": [
          13
        ],
        "h": "Look in the paragraph about how teammates communicate. Find the sentence that starts with “Without.”",
        "h2": "The question asks what COULD happen with no call. Look for a sentence that tells about a problem, not about what players do when they do call.",
        "ex": "“Without that call, the two players might crash into each other and drop the ball.” tells what could happen with no call."
      },
      {
        "id": "p1q5",
        "sk": "sequence",
        "q": "In a relay, what happens right after the infielder catches the ball from the outfielder?",
        "c": [
          "The outfielder chases down the ball.",
          "The batter hits the ball deep into the outfield.",
          "The infielder turns and throws the ball the rest of the way.",
          "The infielder shouts, “I got it!”"
        ],
        "a": 2,
        "h": "Find the sentence that starts “That player catches it.” Read the rest of that sentence.",
        "h2": "“That player” is the infielder. The sentence lists three actions in order: catches, turns, and one more. What is the last one?",
        "ex": "The passage says: “That player catches it, turns, and quickly throws it the rest of the way.”",
        "why": [
          "That happens BEFORE the infielder catches the ball.",
          "That happens first, before the relay even starts.",
          null,
          "Calling “I got it!” is for a high fly ball in the third paragraph, not part of the relay."
        ]
      },
      {
        "id": "p1q6",
        "sk": "inference",
        "q": "Why might two players crash into each other if nobody calls for a high fly ball?",
        "c": [
          "The catcher would give the wrong hand signal.",
          "Both players would run to catch the same ball.",
          "The ball would be too high for anyone to see.",
          "The players would be standing too far apart."
        ],
        "a": 1,
        "h": "Read the third paragraph. Who is near the ball when it goes up between two players?",
        "h2": "The call tells the other player to move out of the way. Think about what each player would do if nobody said anything.",
        "ex": "The ball goes up between two players. Without a call, both would try to catch it and run to the same spot. That is how they could crash.",
        "why": [
          "Hand signals tell the pitcher what to throw. They are not about fly balls.",
          null,
          "The passage never says the ball is hard to see.",
          "The ball is BETWEEN the two players, so they are close enough to bump into each other."
        ]
      }
    ]
  },
  {
    "id": "p2",
    "title": "The Thankful Tree",
    "type": "Fiction",
    "topic": "A family Thanksgiving activity",
    "paras": [
      [
        "Every Thanksgiving, the Carter family made a thankful tree before dinner.",
        "First, Grandpa Leon stuck a tall, bare branch into a flowerpot and set it in the middle of the living room.",
        "Then he handed everyone a stack of paper leaves cut from orange, red, and yellow construction paper."
      ],
      [
        "“Write one thing you are thankful for on each leaf,” Grandpa said.",
        "Nia’s cousins started writing right away, but Nia hesitated, holding her marker above the paper without writing a single word.",
        "She was thankful for lots of things, yet every idea seemed too small or too silly.",
        "Soon the branch was covered with leaves from everyone except her, and her cheeks felt hot."
      ],
      [
        "Grandpa noticed and sat down beside her on the rug.",
        "“A thankful leaf doesn’t have to be fancy,” he said gently.",
        "“What made you smile this week?”",
        "Nia thought for a moment, and then she remembered how her little brother, Jace, had shared his last cracker with her.",
        "She also remembered the warm cinnamon rolls her aunt had baked that morning."
      ],
      [
        "Nia grabbed her marker and began to write.",
        "Before long, she had filled five leaves, and she hung them carefully on the lowest branch.",
        "At dinner, the family took turns reading the leaves out loud.",
        "When Grandpa read Nia’s leaf about the cracker, Jace beamed, and Nia felt proud that she had shared her ideas."
      ]
    ],
    "qs": [
      {
        "id": "p2q1",
        "sk": "sequence",
        "q": "What did Grandpa Leon do FIRST to make the thankful tree?",
        "c": [
          "He handed out paper leaves.",
          "He stuck a bare branch into a flowerpot.",
          "He told everyone to write one thing on each leaf.",
          "He sat down beside Nia on the rug."
        ],
        "a": 1,
        "h": "Look for the signal word First in the first paragraph.",
        "h2": "The first paragraph has two signal words: First and Then. The answer is in the sentence with the signal word that comes before everything else.",
        "ex": "The story says: “First, Grandpa Leon stuck a tall, bare branch into a flowerpot.”",
        "why": [
          "He did that NEXT. That sentence starts with Then.",
          null,
          "He said that after he handed out the leaves.",
          "That happened later, when Nia was stuck."
        ]
      },
      {
        "id": "p2q2",
        "sk": "vocab",
        "q": "What does hesitated mean in this story?",
        "c": [
          "Wrote as fast as she could",
          "Paused because she was not sure what to write",
          "Got up and walked away from the tree",
          "Chose the brightest color of paper"
        ],
        "a": 1,
        "h": "Read the rest of that sentence and the sentence after it. Was Nia writing? Why not?",
        "h2": "Nia held her marker above the paper, and every idea seemed too small. Think about what you do with your pencil when you cannot decide what to write.",
        "ex": "Nia held her marker above the paper without writing, because every idea seemed too small. Hesitated means she paused because she was unsure.",
        "why": [
          "Her cousins wrote right away. Nia did not write a single word.",
          null,
          "Nia stayed right there holding her marker. She did not walk away.",
          "The story never says she picked a color of paper."
        ]
      },
      {
        "id": "p2q3",
        "sk": "inference",
        "q": "Why did Nia’s cheeks most likely feel hot?",
        "c": [
          "She was sitting close to a warm fireplace.",
          "She was embarrassed that she had not written anything yet.",
          "She was mad that Grandpa did not help her sooner.",
          "She was excited to hear her leaves read at dinner."
        ],
        "a": 1,
        "h": "Clue: the branch was covered with leaves from everyone EXCEPT her. How do you feel when everyone else is done and you are not?",
        "h2": "Look at the sentence just before her cheeks felt hot. Think about a feeling that can make your face warm when others might notice you.",
        "ex": "Everyone else had leaves on the tree, and Nia had none. Many people feel embarrassed in that spot, and their cheeks can feel hot.",
        "why": [
          "The story never says there was a fireplace.",
          null,
          "Grandpa had not noticed yet, and nothing shows Nia was mad at him.",
          "Dinner came later, after she wrote her leaves. At this point she had none."
        ]
      },
      {
        "id": "p2q4",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap something Grandpa SAID that helped Nia think of an idea.",
        "ok": [
          8,
          9
        ],
        "h": "Look in the paragraph where Grandpa sits down beside Nia. Find his words inside quotation marks.",
        "h2": "Grandpa speaks two times in that paragraph. Pick words that helped Nia, not his first directions to the whole family.",
        "ex": "Grandpa said, “A thankful leaf doesn’t have to be fancy,” and asked, “What made you smile this week?” Those words helped Nia remember good things."
      },
      {
        "id": "p2q5",
        "sk": "main",
        "q": "What is this story mostly about?",
        "c": [
          "Nia remembers that Jace shared his last cracker with her.",
          "The Carter family reads thankful leaves out loud at dinner.",
          "A girl gets help thinking of ideas for her family’s thankful tree.",
          "A family cooks a big Thanksgiving dinner together."
        ],
        "a": 2,
        "h": "Think about Nia’s trouble at the beginning and what happens at the end.",
        "h2": "The story follows Nia from start to finish. The best answer tells about her whole story, not one moment in it.",
        "ex": "Nia cannot think of what to write, Grandpa helps her, and she fills five leaves. That is what the whole story is about.",
        "why": [
          "This is true, but it is one idea Nia writes about. It is too small.",
          "This happens at the end, but it is only one part of the story.",
          null,
          "The story never tells about cooking the dinner."
        ]
      },
      {
        "id": "p2q6",
        "sk": "problem",
        "q": "What was Nia’s problem, and how was it solved?",
        "c": [
          "She thought her ideas were too small, and Grandpa helped by asking what made her smile.",
          "She ran out of paper leaves, and Grandpa cut more for her.",
          "She thought her ideas were too small, and her cousins wrote her leaves for her.",
          "Her marker stopped working, and Jace shared his marker with her."
        ],
        "a": 0,
        "h": "Ask: What was hard for Nia? Then ask: What changed so she could start writing?",
        "h2": "Two choices have the right problem. Check the solution part too. Who talked to Nia right before she started writing?",
        "ex": "Nia could not write because every idea seemed too small or silly. Grandpa asked, “What made you smile this week?” and that helped her remember good things to write.",
        "why": [
          null,
          "Nia had a stack of leaves. Her trouble was thinking of what to write.",
          "The problem is right, but her cousins did not write for her. Grandpa helped her think.",
          "Nothing was wrong with her marker. Jace shared a cracker, not a marker."
        ]
      }
    ]
  },
  {
    "id": "p3",
    "title": "Learning to Ride",
    "type": "Fiction",
    "topic": "Helping a friend",
    "paras": [
      [
        "All summer, Trey watched the kids on Maple Street zoom past his house on their bikes.",
        "He had a shiny green bike of his own, but he had never learned to ride it.",
        "Whenever his friends asked him to race, Trey made up an excuse and stayed on his front steps."
      ],
      [
        "One afternoon, his best friend Keisha rolled up and noticed his bike leaning against the garage.",
        "“Why don’t you ever ride it?” she asked.",
        "Trey stared at his sneakers and mumbled, “I don’t know how, and I’m scared I’ll fall.”",
        "Keisha didn’t laugh at him.",
        "“I fell a lot when I was learning,” she said.",
        "“I can help you practice in the empty lot behind the library.”"
      ],
      [
        "For the next three days, the two friends met there after lunch.",
        "Keisha held the back of the seat while Trey pedaled slowly across the smooth pavement.",
        "Each time he wobbled, she reminded him to look straight ahead instead of down at his feet.",
        "On the third day, Trey was pedaling so smoothly that he didn’t notice when Keisha let go."
      ],
      [
        "“You’re doing it by yourself!” Keisha shouted.",
        "Trey was so surprised that he nearly tipped over, but he kept his balance and laughed.",
        "That evening, he rode down Maple Street beside Keisha, and he felt confident instead of afraid."
      ]
    ],
    "qs": [
      {
        "id": "p3q1",
        "sk": "inference",
        "q": "How did Trey most likely feel when his friends asked him to race?",
        "c": [
          "Excited because he wanted to show off his new bike",
          "Nervous because he could not ride a bike",
          "Angry because his friends were mean to him",
          "Bored because he did not like racing"
        ],
        "a": 1,
        "h": "Clues: what did Trey do when they asked? What did he later tell Keisha?",
        "h2": "Trey made up an excuse each time. People often make excuses when they want to hide something. What was Trey hiding?",
        "ex": "Trey made up an excuse and stayed on his steps, and later he said he did not know how to ride and was scared of falling. Those clues show he felt nervous.",
        "why": [
          "If he wanted to show off his bike, he would have raced. He stayed on his steps instead.",
          null,
          "Nothing in the story shows his friends were mean. They kept inviting him.",
          "The story shows he was scared, not bored. He told Keisha he was afraid of falling."
        ]
      },
      {
        "id": "p3q2",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that shows Trey was afraid to ride his bike.",
        "ok": [
          2,
          5,
          15
        ],
        "h": "Look at what Trey did when his friends asked him to race, and what he told Keisha.",
        "h2": "Look for a sentence where Trey avoids riding, or where he says how he feels about falling.",
        "ex": "Good proof: he made up an excuse not to race, he said, “I’m scared I’ll fall,” and at the end he felt confident “instead of afraid.”"
      },
      {
        "id": "p3q3",
        "sk": "detail",
        "q": "Where did Keisha help Trey practice?",
        "c": [
          "On Maple Street",
          "In Trey’s driveway by the garage",
          "In the empty lot behind the library",
          "In the park next to the school"
        ],
        "a": 2,
        "h": "Read what Keisha said at the end of the second paragraph.",
        "h2": "Keisha names the place when she offers to help. Read her last words in quotation marks.",
        "ex": "Keisha said, “I can help you practice in the empty lot behind the library.”",
        "why": [
          "Trey rode on Maple Street at the END, after he learned.",
          "His bike leaned against the garage, but they did not practice there.",
          null,
          "A park or school is never mentioned."
        ]
      },
      {
        "id": "p3q4",
        "sk": "sequence",
        "q": "What happened right after Keisha shouted, “You’re doing it by yourself!”?",
        "c": [
          "Keisha let go of the seat.",
          "Trey nearly tipped over, but he kept his balance.",
          "Trey rode down Maple Street beside Keisha.",
          "Keisha reminded Trey to look straight ahead."
        ],
        "a": 1,
        "h": "Find what Keisha shouted. Then read the very next sentence.",
        "h2": "Keisha’s shout surprised Trey. The next sentence tells what his surprise made his bike do.",
        "ex": "The next sentence says Trey was so surprised that he nearly tipped over, but he kept his balance and laughed.",
        "why": [
          "She let go BEFORE she shouted. That is why she shouted.",
          null,
          "That happened later, that evening.",
          "She gave that reminder during practice, before she let go."
        ]
      },
      {
        "id": "p3q5",
        "sk": "theme",
        "q": "What lesson does this story show?",
        "c": [
          "Trey learns to ride his bike after three days of practice.",
          "A patient friend can help you face something scary.",
          "If something scares you, it is best to stay away from it.",
          "Racing bikes is the most fun thing to do in summer."
        ],
        "a": 1,
        "h": "How did Trey change from the beginning to the end? Who helped him change?",
        "h2": "A lesson is a message you could use in your own life, not just a list of what happened. Think about what Keisha did and how it changed Trey’s feelings.",
        "ex": "Trey was scared at first, but Keisha practiced with him for three days. By the end he felt confident. A patient friend helped him face his fear.",
        "why": [
          "This tells what HAPPENED in the story. It is a summary, not a lesson.",
          null,
          "Trey stayed away from riding at first, and that did not help. Facing his fear did.",
          "The story is not about which summer activity is the most fun."
        ]
      },
      {
        "id": "p3q6",
        "sk": "main",
        "q": "What is this story mostly about?",
        "c": [
          "Keisha holds the back of Trey’s seat while he pedals.",
          "A boy who is afraid to ride his bike learns how with help from his friend.",
          "Trey rides down Maple Street beside Keisha one evening.",
          "The kids on Maple Street race their bikes all summer."
        ],
        "a": 1,
        "h": "Think about the whole story: the beginning, the middle, and the end.",
        "h2": "The best answer should tell about Trey at the start AND at the end. A choice about one moment is too small.",
        "ex": "At the start Trey cannot ride and is scared. Keisha helps him practice, and at the end he rides with confidence. That is what the whole story is about.",
        "why": [
          "This is true, but it is only the middle of the story.",
          null,
          "This is true, but it is only the last sentence.",
          "The other kids are in the first sentence, but the story is about Trey."
        ]
      }
    ]
  },
  {
    "id": "p4",
    "title": "The Kite That Would Not Fly",
    "type": "Fiction",
    "topic": "Solving a small problem",
    "paras": [
      [
        "On a windy Saturday in March, Aaliyah carried her new diamond kite to the park near her apartment.",
        "She had saved her allowance for weeks to buy it, and she couldn’t wait to see it soar above the trees.",
        "But every time she let out the string, the kite spun in circles and crashed into the grass."
      ],
      [
        "After the fifth crash, Aaliyah plopped down on a bench and crossed her arms.",
        "“This kite is broken,” she grumbled.",
        "An older boy named Luis was flying a bright red kite nearby, and he walked over to take a look.",
        "“I don’t think it’s broken,” he said.",
        "“Its tail is just too short, so it can’t stay steady in the wind.”"
      ],
      [
        "Aaliyah studied Luis’s kite and noticed that its tail was much longer than hers.",
        "She searched her backpack until she found two long hair ribbons.",
        "Carefully, she tied the ribbons to the end of the kite’s tail to make it longer."
      ],
      [
        "This time, when the wind tugged on the string, the kite climbed higher and higher without spinning.",
        "Aaliyah laughed as it floated above the treetops like a bird.",
        "“Thanks, Luis!” she called across the field.",
        "From then on, she always checked her kite’s tail before she let out the string."
      ]
    ],
    "qs": [
      {
        "id": "p4q1",
        "sk": "problem",
        "q": "What problem did Aaliyah have?",
        "c": [
          "Her kite string was too short to reach above the trees.",
          "Her kite kept spinning in circles and crashing into the grass.",
          "There was not enough wind at the park to lift her kite.",
          "Luis’s red kite kept bumping into her kite."
        ],
        "a": 1,
        "h": "Read the last sentence of the first paragraph. It starts with But.",
        "h2": "A story problem is what goes wrong for the character. The word But shows where things stop going the way Aaliyah hoped.",
        "ex": "Every time Aaliyah let out the string, her kite spun in circles and crashed into the grass.",
        "why": [
          "The problem was the kite’s TAIL, not the string.",
          null,
          "It was a windy Saturday. The wind was not the problem.",
          "Luis helped her. His kite never bumped hers."
        ]
      },
      {
        "id": "p4q2",
        "sk": "sequence",
        "q": "What did Aaliyah do right after Luis said the tail was too short?",
        "c": [
          "She sat on a bench and crossed her arms.",
          "She tied two ribbons to the tail.",
          "She studied Luis’s kite and saw its long tail.",
          "She searched her backpack for ribbons."
        ],
        "a": 2,
        "h": "Find what Luis said about the tail. Then read the first sentence of the next paragraph.",
        "h2": "Before Aaliyah could fix her kite, she needed to see what a good tail looks like. Whose kite did she look at?",
        "ex": "Right after Luis spoke, Aaliyah studied his kite and noticed its tail was much longer than hers.",
        "why": [
          "She sat on the bench BEFORE Luis came over.",
          "She tied the ribbons later, after she found them.",
          null,
          "She searched her backpack next, but only after she studied Luis’s kite."
        ]
      },
      {
        "id": "p4q3",
        "sk": "vocab",
        "q": "What does soar mean in this story?",
        "c": [
          "To fly high in the air",
          "To spin around in circles",
          "To crash into the grass",
          "To float slowly near the ground"
        ],
        "a": 0,
        "h": "Read “soar above the trees.” Then look at what the kite does in the last paragraph once it works.",
        "h2": "The words “above the trees” tell where Aaliyah hoped the kite would be. Soar is what she WANTED to happen, not what went wrong.",
        "ex": "Aaliyah wanted to see her kite soar above the trees. At the end it climbs higher and higher and floats above the treetops, so soar means to fly high in the air.",
        "why": [
          null,
          "Spinning in circles was the problem, not what she hoped to see.",
          "Crashing was the problem, the opposite of what she wanted.",
          "She wanted it ABOVE the trees, not near the ground."
        ]
      },
      {
        "id": "p4q4",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that proves Aaliyah’s idea worked.",
        "ok": [
          11,
          12
        ],
        "h": "Look in the last paragraph. What did the kite do after she made the tail longer?",
        "h2": "Her idea was to make the tail longer so the kite would not spin. Find a sentence that shows the kite flying well.",
        "ex": "The kite “climbed higher and higher without spinning” and “floated above the treetops.” Both show the longer tail worked."
      },
      {
        "id": "p4q5",
        "sk": "inference",
        "q": "Why did Aaliyah start checking her kite’s tail before flying it?",
        "c": [
          "Because Luis told her to check it every day",
          "So her kite would not spin and crash again",
          "Because a longer tail makes a kite fly lower",
          "So her kite would look just like Luis’s kite"
        ],
        "a": 1,
        "h": "Think about the problem she just solved. What would keep it from happening again?",
        "h2": "She learned what caused her kite to crash. Checking the tail is a way to stop that cause before it starts.",
        "ex": "A short tail made her kite crash. Checking the tail first helps make sure it stays steady and does not crash again.",
        "why": [
          "Luis only explained the problem. He never told her to check it every day.",
          null,
          "The longer tail helped her kite climb HIGHER, not lower.",
          "The story is about how the kite flies, not how it looks."
        ]
      },
      {
        "id": "p4q6",
        "sk": "theme",
        "q": "What lesson can readers learn from this story?",
        "c": [
          "Aaliyah’s kite flies after she ties two ribbons to its tail.",
          "When something goes wrong, find out why instead of giving up.",
          "If something does not work, you should buy a new one.",
          "Red kites fly better than diamond kites."
        ],
        "a": 1,
        "h": "At first Aaliyah said, “This kite is broken.” What did she learn instead?",
        "h2": "A lesson is a message you can use in many places, not just with kites. Think about what Aaliyah did after she learned the real reason her kite crashed.",
        "ex": "Aaliyah almost gave up, but she found out the tail was too short and fixed it. The lesson is to find out what is wrong instead of giving up.",
        "why": [
          "This tells what happened. It is a summary, not a lesson.",
          null,
          "Her kite was not broken. She fixed it instead of buying a new one.",
          "The color and shape of the kite did not matter. The tail did."
        ]
      }
    ]
  },
  {
    "id": "p5",
    "title": "How Squirrels Prepare for Winter",
    "type": "Nonfiction",
    "topic": "Animals and nature",
    "paras": [
      [
        "In autumn, you might see a gray squirrel dashing across a yard with an acorn in its mouth.",
        "The squirrel is not playing a game.",
        "Gray squirrels do not sleep through the winter, so they must get ready for the cold months while food is still easy to find."
      ],
      [
        "Instead of keeping all their food in one place, gray squirrels bury nuts one at a time in many different spots.",
        "A squirrel digs a small hole, drops in a nut, and pats the soil down with its front paws.",
        "Storing food this way is called scatter hoarding.",
        "One busy squirrel can bury thousands of nuts in a single fall!"
      ],
      [
        "Later, when the ground is covered with leaves or snow, the squirrel must find its hidden meals.",
        "Gray squirrels remember the general area of many of their hiding spots.",
        "Then they use their strong sense of smell to sniff out the exact place.",
        "Still, squirrels do not dig up every nut they bury.",
        "Some of the forgotten acorns sprout in the spring and slowly grow into new oak trees."
      ],
      [
        "Squirrels also build round nests called dreys high in the branches.",
        "They weave twigs together and line the inside with soft leaves and moss.",
        "On freezing nights, a squirrel may curl up in its drey and wrap its fluffy tail around its body like a blanket."
      ]
    ],
    "qs": [
      {
        "id": "p5q1",
        "sk": "main",
        "q": "What is the main idea of this passage?",
        "c": [
          "Gray squirrels store food and build nests to get through the winter.",
          "Some acorns that squirrels forget grow into oak trees.",
          "Squirrels build round nests called dreys high in the branches.",
          "Many animals sleep through the whole winter."
        ],
        "a": 0,
        "h": "Look at the title and the last sentence of the first paragraph. What do the other paragraphs explain?",
        "h2": "The paragraphs tell about burying nuts, finding them, and building nests. Ask: what do all three of those help a squirrel do?",
        "ex": "The passage explains how gray squirrels hide food, find it later, and build nests so they can make it through the cold winter.",
        "why": [
          null,
          "This is true, but it is one detail in the third paragraph.",
          "This is true, but it is only the last paragraph.",
          "The passage says gray squirrels do NOT sleep through the winter."
        ]
      },
      {
        "id": "p5q2",
        "sk": "vocab",
        "q": "What does the word sprout mean in this passage?",
        "c": [
          "To rot and turn brown",
          "To begin to grow",
          "To be buried in a hole",
          "To be dug up and eaten"
        ],
        "a": 1,
        "h": "Read the whole sentence: the acorns sprout in the spring and then grow into oak trees.",
        "h2": "The acorns sprout first and then slowly become trees. What must happen to a seed before it can become a tree?",
        "ex": "The forgotten acorns sprout and slowly grow into new oak trees. Sprout means to begin to grow.",
        "why": [
          "Something that rots could not grow into a tree.",
          null,
          "The acorns were already buried before they sprouted.",
          "These acorns were forgotten, so they were NOT dug up and eaten."
        ]
      },
      {
        "id": "p5q3",
        "sk": "detail",
        "q": "How does a gray squirrel find the exact spot where it buried a nut?",
        "c": [
          "It follows a trail of leaves.",
          "It looks for the hole it dug.",
          "It sniffs it out with its strong sense of smell.",
          "It remembers the exact spot of every single nut."
        ],
        "a": 2,
        "h": "Read the third paragraph carefully. Find the word exact.",
        "h2": "The passage tells two steps. Memory gets the squirrel to the general area. Then a different sense finds the exact place.",
        "ex": "The passage says squirrels remember the general area, and then “they use their strong sense of smell to sniff out the exact place.”",
        "why": [
          "The passage never mentions a trail of leaves.",
          "The squirrel pats the soil down, and leaves or snow cover the ground, so the hole is hidden.",
          null,
          "Squirrels remember the general AREA, and they do not find every nut."
        ]
      },
      {
        "id": "p5q4",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap the sentence that shows squirrels can help new trees grow.",
        "ok": [
          11
        ],
        "h": "Look in the third paragraph for the word trees.",
        "h2": "Look for a sentence about nuts the squirrels did NOT dig up and what happens to them in spring.",
        "ex": "“Some of the forgotten acorns sprout in the spring and slowly grow into new oak trees.” shows that the nuts squirrels bury can become trees."
      },
      {
        "id": "p5q5",
        "sk": "inference",
        "q": "Why do gray squirrels bury food in the fall instead of waiting until winter?",
        "c": [
          "In winter, food is harder to find, so they need a supply saved up.",
          "They sleep all winter, so they cannot look for food then.",
          "They want to plant new oak trees for the spring.",
          "Nuts taste better after they have been buried."
        ],
        "a": 0,
        "h": "Clue: the first paragraph says they get ready “while food is still easy to find.” What do you know about food and plants in winter?",
        "h2": "If food is easy to find NOW, think about what winter will be like. Leaves and snow cover the ground, and few plants grow.",
        "ex": "The passage says squirrels get ready while food is still easy to find. In winter, few plants grow and snow covers the ground, so saved food helps them eat.",
        "why": [
          null,
          "The passage says gray squirrels do NOT sleep through the winter. They dig up food then.",
          "The trees grow from nuts they FORGET. They do not plan to plant trees.",
          "The passage never says burying makes nuts taste better."
        ]
      },
      {
        "id": "p5q6",
        "sk": "sequence",
        "q": "When a squirrel buries a nut, what does it do right after it drops the nut into the hole?",
        "c": [
          "It digs a small hole.",
          "It pats the soil down with its front paws.",
          "It sniffs out the exact place.",
          "It weaves twigs into a nest."
        ],
        "a": 1,
        "h": "Find the sentence in the second paragraph that tells the steps of burying one nut.",
        "h2": "That sentence lists three steps in order: digs, drops, and one more. The last step covers up the nut.",
        "ex": "The passage says a squirrel “digs a small hole, drops in a nut, and pats the soil down with its front paws.”",
        "why": [
          "Digging comes BEFORE the squirrel drops the nut in.",
          null,
          "Sniffing happens much later, when the squirrel comes back to find the nut.",
          "Building a nest is a different job in the last paragraph."
        ]
      }
    ]
  },
  {
    "id": "p6",
    "title": "Caps On",
    "type": "Fiction",
    "topic": "Learning from a mistake",
    "paras": [
      [
        "Jalen’s older sister, Simone, owned a set of fifty markers that she used for her art club projects.",
        "One rainy afternoon, Jalen wanted to color a poster of a giant dragon, so he borrowed the markers while Simone was at soccer practice.",
        "He didn’t ask first, because he planned to put them back before she got home."
      ],
      [
        "Jalen colored for an hour, and then he rushed outside when the rain stopped.",
        "He left the markers scattered across the kitchen table, and most of the caps were still off.",
        "That evening, Simone found them lying there.",
        "When she tried to draw with her favorite purple marker, it made only a faint, scratchy line because it was drying out.",
        "“Jalen!” she called from the kitchen.",
        "“Who left my markers open?”"
      ],
      [
        "Jalen’s stomach sank when he saw the pile of uncapped markers.",
        "He knew he should have asked, and he should have put the caps back on.",
        "“I’m sorry, Simone,” he said quietly.",
        "“I used your markers without asking, and I didn’t take care of them.”"
      ],
      [
        "That weekend, Jalen used his own allowance to buy Simone a new purple marker.",
        "He also promised to ask before borrowing anything and to snap every cap on tightly.",
        "Two weeks later, Jalen asked to borrow the markers, and Simone said yes because she trusted him to be careful."
      ]
    ],
    "qs": [
      {
        "id": "p6q1",
        "sk": "sequence",
        "q": "Which of these happened FIRST?",
        "c": [
          "Jalen rushed outside when the rain stopped.",
          "Jalen borrowed the markers without asking.",
          "Simone found the markers on the table.",
          "Jalen told Simone he was sorry."
        ],
        "a": 1,
        "h": "Look at the first paragraph. What did Jalen do on the rainy afternoon?",
        "h2": "Jalen had to have the markers before he could color, go outside, or leave them on the table. Start at the very beginning of the story.",
        "ex": "On the rainy afternoon, Jalen borrowed the markers without asking. Everything else happened later.",
        "why": [
          "He went outside after he colored for an hour.",
          null,
          "Simone found the markers that evening, after Jalen went outside.",
          "He said sorry after Simone found the markers."
        ]
      },
      {
        "id": "p6q2",
        "sk": "inference",
        "q": "How did Jalen most likely feel when he saw the pile of uncapped markers?",
        "c": [
          "Proud of his dragon poster",
          "Guilty because he knew he made a mistake",
          "Angry that Simone called his name",
          "Excited to color some more"
        ],
        "a": 1,
        "h": "Clues: his “stomach sank,” and he knew what he should have done. How do you feel when you know you did something wrong?",
        "h2": "Read the sentence after his stomach sank. It tells what Jalen knew about his own choices.",
        "ex": "His stomach sank, and he knew he should have asked and put the caps on. Those clues show he felt guilty.",
        "why": [
          "He may have liked his poster, but in this moment his stomach sank.",
          null,
          "Jalen said sorry quietly. Nothing shows he was angry at Simone.",
          "The markers were drying out, and his stomach sank. He was not excited."
        ]
      },
      {
        "id": "p6q3",
        "sk": "vocab",
        "q": "What does faint mean in this story?",
        "c": [
          "Dark and thick",
          "Light and hard to see",
          "Wet and smeary",
          "Long and straight"
        ],
        "a": 1,
        "h": "Read the whole sentence. The marker was drying out. What kind of line does a dry marker make?",
        "h2": "The line was also “scratchy,” and the marker had little ink left. Think about how much color a nearly dry marker puts on paper.",
        "ex": "A drying marker has little ink left, so its line is light and hard to see. That is what faint means.",
        "why": [
          "A marker that is drying out does not have enough ink for a dark, thick line.",
          null,
          "The marker was drying out, so its line was not wet.",
          "The story tells about how the line looked, not how long it was."
        ]
      },
      {
        "id": "p6q4",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that shows something Jalen did to make up for his mistake.",
        "ok": [
          11,
          12,
          13,
          14,
          15
        ],
        "h": "Look at what Jalen said to Simone and what he did after that.",
        "h2": "Look for a sentence where Jalen says sorry, tells the truth, fixes the damage, or does better next time.",
        "ex": "Jalen said he was sorry and admitted what he did wrong, bought Simone a new purple marker, promised to ask first and put the caps on, and later asked before borrowing."
      },
      {
        "id": "p6q5",
        "sk": "theme",
        "q": "What lesson did Jalen learn?",
        "c": [
          "Jalen buys Simone a new purple marker with his allowance.",
          "Ask before you borrow, and take good care of other people’s things.",
          "It is fine to borrow things if you plan to put them back fast.",
          "Art projects need a lot of markers."
        ],
        "a": 1,
        "h": "What did Jalen do wrong, and what did he promise at the end?",
        "h2": "A lesson is a message, not an event. Look at Jalen’s promise in the last paragraph. It tells what he will do differently.",
        "ex": "Jalen borrowed without asking and left the caps off. He promised to ask first and snap every cap on, and Simone learned to trust him again.",
        "why": [
          "This is something that happened, not the lesson he learned.",
          null,
          "That is what Jalen thought at FIRST, and it led to his mistake.",
          "The story is not about how many markers art needs."
        ]
      },
      {
        "id": "p6q6",
        "sk": "problem",
        "q": "How did Jalen try to fix the problem he caused?",
        "c": [
          "He hid the dried-out marker so Simone would not see it.",
          "He said sorry, bought a new purple marker, and promised to be careful.",
          "He asked Simone to buy new markers with her own money.",
          "He colored a new dragon poster for Simone."
        ],
        "a": 1,
        "h": "The problem was the dried-out purple marker. Read the last two paragraphs. What did Jalen say and do?",
        "h2": "A good solution fixes the harm and helps make sure it does not happen again. Look for the choice that does both.",
        "ex": "Jalen said he was sorry, used his own allowance to buy a new purple marker, and promised to ask first and snap every cap on.",
        "why": [
          "Jalen told the truth. He did not hide anything.",
          null,
          "Jalen used HIS OWN allowance, not Simone’s money.",
          "The story never says he made Simone a poster."
        ]
      }
    ]
  }
];
var LESSONS = {
  workshop: [],
  verbs: [
    { id: 'A', title: 'Action Verbs', skill: 'action', key: 'A verb can tell what someone or something does.', steps: [
      { t: 'explain', title: 'Action verbs', text: ['A verb can tell what someone or something does.', 'Some actions you can see, like run and throw.', 'Some actions happen in your head, like think and learn.'] },
      { t: 'show', img: 'verbs', title: 'Watch me find it', mode: 'verb', s: 'Chris [swings] the bat.', labels: { swings: 'verb' }, text: ['Swings tells what Chris does.', 'We draw TWO lines under a verb.'] },
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
    ] },
    { id: 'H', title: 'Find Every Verb', skill: 'multi', key: 'A sentence can have more than one verb or verb team. Find them all.', steps: [
      { t: 'explain', title: 'More than one verb', text: ['A sentence can have more than one verb.', 'Words like and, so, while, and when often join two actions.', 'Find EVERY verb and every verb team.'] },
      { t: 'show', title: 'Watch me find them', mode: 'verb', s: 'Chris [ran:a] and [jumped:b].', labels: { ran: 'verb 1', jumped: 'verb 2' }, text: ['Ran is one action. Jumped is another action.', 'And is not a verb. It joins the two actions.'] },
      { t: 'show', title: 'A verb team plus a verb', mode: 'verb', s: 'The boy [was:a] [singing:a] while his sister [danced:b].', labels: { was: 'helper', singing: 'main verb', danced: 'verb 2' }, text: ['Verb team 1: was singing', 'Verb 2: danced', 'While joins the two parts. It is not a verb.'] },
      { t: 'explain', title: 'Coach tip: keep going!', text: ['After you find one verb, do not stop.', 'Read to the end. Ask: Does anything else happen?', 'Tap every verb word you find.'] },
      { t: 'guided', coach: 'Find what Mia did FIRST. Then keep reading. What else did she do?', q: { mode: 'verb', s: 'Mia [kicked:a] the ball and [ran:b] to first base.', h: 'Mia did two things. Find both actions.', ex: 'Kicked and ran are both verbs. And joins them.', notes: { and: 'And joins the two actions. It is not a verb.', base: 'Base is a place.' } } },
      { t: 'try', q: { mode: 'verb', s: 'We [will:a] [eat:a] lunch, and then we [will:b] [play:b] tag.', h: 'There are two verb teams. Each one has a helper.', ex: 'Will eat is one verb team. Will play is another verb team.', notes: { then: 'Then tells when. It is not a verb.', lunch: 'Lunch is a thing.', tag: 'Tag is a game (a thing) here.' } } },
      { t: 'try', q: { mode: 'verb', s: 'The dog [barked:a] when the doorbell [rang:b].', h: 'What did the dog do? What did the doorbell do?', ex: 'Barked and rang are both verbs. When joins the two parts.', notes: { when: 'When joins the two parts of the sentence. It is not a verb.' } } }
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
      { t: 'show', img: 'nouns', title: 'Another one', mode: 'noun', s: 'The [coach:p] stood on the [field:l].', labels: { coach: 'person', field: 'place' }, text: ['Coach names a person.', 'Field names a place.'] },
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
      { t: 'explain', title: 'Adjectives', text: ['An adjective describes a noun.', 'It can tell what kind, which one, or how many.', 'Little words like the, a, and my will be gray. You do not tap them here.'] },
      { t: 'show', img: 'adjectives', title: 'Watch me find it', mode: 'adj', s: 'The [red@ball] ball rolled.', text: ['Red describes ball.', 'It tells what kind of ball.'] },
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
      { t: 'show', img: 'adverbs', title: 'Watch me find it', mode: 'adv', s: 'Chris runs [quickly@runs:how].', text: ['Quickly tells HOW Chris runs.'] },
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
      { t: 'words', title: 'Short vowel words', say: true, groups: [ { name: 'short a', words: ['cap', 'cat'] }, { name: 'short e', words: ['bed', 'ten'] }, { name: 'short i', words: ['kit', 'pig'] }, { name: 'short o', words: ['hop', 'pot'] }, { name: 'short u', words: ['cup', 'tub'] } ] },
      { t: 'mc', q: { q: 'Which word has the CVC pattern for a short vowel?', c: ['cape', 'hop', 'rain'], a: 1, say: true, h: 'Find one vowel between two consonants.', ex: 'Hop is h-o-p: one vowel between two consonants.' } }
    ] },
    { id: 'C', title: 'Long Vowel Sounds', skill: 'long', key: 'A long vowel says its own name.', steps: [
      { t: 'explain', title: 'Long vowels', text: ['A long vowel says its own name.', 'Long a as in cake, long i as in kite, long o as in home.', 'Long e as in me, long u as in cute.'] },
      { t: 'mc', q: { q: 'In kite, the i says its name. What kind of vowel sound is that?', c: ['long', 'short'], a: 0, say: true, h: 'When a vowel says its own name, it is...', ex: 'When a vowel says its name, it is a long vowel.' } }
    ] },
    { id: 'D', title: 'Silent e', skill: 'silente', key: 'Silent e often helps the earlier vowel say its name.', steps: [
      { t: 'explain', title: 'The silent e', text: ['Silent e often helps the earlier vowel say its name.', 'You do not hear the e at the end.'] },
      { t: 'table', img: 'vowels', title: 'Add an e and watch', say: true, head: ['Short', 'Add silent e → Long'], rows: [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['cub', 'cube']] },
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
      { t: 'explain', img: 'reading', title: 'Main idea', text: ['The main idea is what a passage is MOSTLY about.', 'It is bigger than one detail.', 'Tip: ask, "What do most sentences talk about?"'] },
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


/* Lesson H practice (multiple verbs). Kept separate from the original 59 practice sentences. */
var VERB_MULTI_PRACTICE = [
  { id: 'vh1', sk: 'multi', s: 'In the school garden, Nia [dug:a] a small hole and [dropped:b] a seed inside.', h: 'Nia did two things. Find both actions.', ex: 'Dug and dropped are both verbs. And joins them.', notes: { and: 'And joins the two actions. It is not a verb.', hole: 'Hole is a thing (a noun).', inside: 'Inside tells where. It is not a verb.' } },
  { id: 'vh2', sk: 'multi', s: 'The thunder [boomed:a] loudly, so the puppy [crawled:b] under my bed.', h: 'What did the thunder do? What did the puppy do?', ex: 'Boomed and crawled are both verbs. So joins the two parts.', notes: { so: 'So joins the two parts. It is not a verb.', loudly: 'Loudly tells HOW the thunder boomed. It is not a verb.', bed: 'Bed is a thing (a noun).' } },
  { id: 'vh3', sk: 'multi', s: 'Grandma [was:a] [slicing:a] ripe peaches while Kofi [washed:b] the glass jars.', h: 'Find a verb team for Grandma and one more verb for Kofi.', ex: 'Was slicing is one verb team. Washed is another verb.', notes: { while: 'While joins the two parts. It is not a verb.', ripe: 'Ripe describes the peaches. It is not a verb.', jars: 'Jars are things (nouns).' } },
  { id: 'vh4', sk: 'multi', s: 'The crossing guard [smiled:a] as the children [were:b] [walking:b] across the street.', h: 'What did the guard do? What were the children doing?', ex: 'Smiled is one verb. Were walking is a verb team.', notes: { crossing: 'Here crossing tells what kind of guard. It is not a verb in this sentence.', as: 'As joins the two parts. It is not a verb.', street: 'Street is a place (a noun).' } },
  { id: 'vh5', sk: 'multi', s: 'My cousins [have:a] [visited:a] the planetarium, and they [loved:b] the star show.', h: 'Find a verb team with a helper, then keep reading. What else did they do?', ex: 'Have visited is one verb team. Loved is another verb.', notes: { and: 'And joins the two parts. It is not a verb.', show: 'Here show is a thing they watched, so it is a noun.', planetarium: 'Planetarium is a place (a noun).' } },
  { id: 'vh6', sk: 'multi', s: 'When the kitchen timer [beeped:a], Ava [pulled:b] the warm muffins from the oven.', h: 'What did the timer do? What did Ava do?', ex: 'Beeped and pulled are both verbs. When joins the two parts.', notes: { when: 'When joins the two parts. It is not a verb.', warm: 'Warm describes the muffins. It is not a verb.', timer: 'Timer is a thing (a noun).' } }
];

/* Verb CHECK MY SKILLS bank: separate from practice sentences and from the mastery challenge. */
var VERB_CHECK = [
  { id: 'vc1', sk: 'action', s: 'In the quiet museum, Tyrell [studied] an old map of Georgia.', ask: 'What did Tyrell do?', h: 'What did Tyrell do with the map?', ex: 'Studied tells what Tyrell did.', notes: { quiet: 'Quiet describes the museum. It is not a verb.', map: 'Here map is a thing, so it is a noun.', old: 'Old describes the map. It is not a verb.' } },
  { id: 'vc2', sk: 'action', s: 'The tiny hummingbird [sipped] sweet nectar from the bright red flower.', ask: 'What did the hummingbird do?', h: 'Picture the hummingbird at the flower. What did it do?', ex: 'Sipped tells what the hummingbird did.', notes: { tiny: 'Tiny describes the hummingbird. It is not a verb.', sweet: 'Sweet describes the nectar. It is not a verb.', flower: 'Flower is a thing (a noun).' } },
  { id: 'vc3', sk: 'action', s: 'After the rain shower, a bright rainbow [stretched] across the sky.', ask: 'What did the rainbow do?', h: 'Which word tells what the rainbow did?', ex: 'Stretched is the verb. It tells what the rainbow did.', notes: { shower: 'Here shower is a short rain (a thing), so it is a noun.', bright: 'Bright describes the rainbow. It is not a verb.', across: 'Across starts the words that tell where. It is not a verb.' } },
  { id: 'vc4', sk: 'action', s: 'Our school nurse gently [bandaged] the scrape on my knee.', ask: 'What did the nurse do?', h: 'What did the nurse do to the scrape?', ex: 'Bandaged tells what the nurse did. Gently tells how.', notes: { gently: 'Gently tells HOW. It is an adverb, not a verb.', scrape: 'Here scrape is a thing (a hurt spot), so it is a noun.', nurse: 'Nurse names a person (a noun).' } },
  { id: 'vc5', sk: 'being', s: 'In January, the pond behind the old farmhouse [was] icy and slippery.', h: 'Nobody does an action. Find the BE word.', ex: 'Was is the verb. Icy and slippery describe the pond.', notes: { icy: 'Icy describes the pond. It is not a verb.', slippery: 'Slippery describes the pond. It is not a verb.', pond: 'Pond is a place (a noun).' } },
  { id: 'vc6', sk: 'being', s: 'My grandparents [are] in Savannah for the long holiday weekend.', h: 'Find the BE word. It tells where my grandparents are.', ex: 'Are is the verb. It stands alone with no helper role.', notes: { holiday: 'Holiday tells what kind of weekend. It is not a verb.', long: 'Long describes the weekend. It is not a verb.', savannah: 'Savannah is a place (a city).' } },
  { id: 'vc7', sk: 'being', s: 'The tallest giraffe at the zoo [has] a long purple tongue.', h: 'Is there another verb after has?', ex: 'Has is the main verb here. It tells what the giraffe has.', notes: { tallest: 'Tallest describes the giraffe. It is not a verb.', purple: 'Purple describes the tongue. It is not a verb.', tongue: 'Tongue is a thing (a noun).' } },
  { id: 'vc8', sk: 'team', s: 'Two firefighters [were] [teaching] our class about smoke alarms today.', ask: 'What were the firefighters doing?', h: 'Ask: What were the firefighters doing?', ex: 'Were helps teaching. The verb team: were teaching.', notes: { smoke: 'Smoke tells what kind of alarms. It is not a verb.', alarms: 'Alarms are things (nouns).', today: 'Today tells when. It is not a verb.' } },
  { id: 'vc9', sk: 'team', s: 'The farmer [will] [harvest] the sweet corn before the first frost.', ask: 'What will the farmer do?', h: 'Will is a helper. What will the farmer do?', ex: 'Will helps harvest. The verb team: will harvest.', notes: { corn: 'Corn is a thing (a noun).', frost: 'Here frost is a thing (the first frost), so it is a noun.', sweet: 'Sweet describes the corn. It is not a verb.' } },
  { id: 'vc10', sk: 'team', s: 'On the open grassland, ostriches [can] [run] much faster than people.', ask: 'What can ostriches do?', h: 'Can is a helper. What can ostriches do?', ex: 'Can helps run. The verb team: can run.', notes: { faster: 'Faster tells how they run. It is not a verb.', open: 'Here open describes the grassland. It is not a verb.', people: 'People is a noun.' } },
  { id: 'vc11', sk: 'team', s: 'Before class, the art teacher [had] [mixed] purple paint for our project.', ask: 'What had the art teacher done?', h: 'Had is a helper here. Which -ed word does it help?', ex: 'Had helps mixed. The verb team: had mixed.', notes: { paint: 'Here paint is a thing, so it is a noun.', purple: 'Purple describes the paint. It is not a verb.', project: 'Project is a thing (a noun).' } },
  { id: 'vc12', sk: 'long', s: 'Two robins [have] [been] [gathering] twigs for a nest in our mailbox.', ask: 'What have the robins been doing?', h: 'Find two helpers and the main verb.', ex: 'Have and been help gathering. The whole team: have been gathering.', notes: { twigs: 'Twigs are things (nouns).', nest: 'Here nest is a thing, so it is a noun.', mailbox: 'Mailbox is a thing (a noun).' } },
  { id: 'vc13', sk: 'long', s: 'The librarian [will] [be] [reading] a spooky story at the fall festival.', ask: 'What will the librarian be doing?', h: 'Find two helpers and the main verb.', ex: 'Will and be help reading. The whole team: will be reading.', notes: { spooky: 'Spooky describes the story. It is not a verb.', fall: 'Here fall is a season. It is not a verb.', festival: 'Festival is a thing (an event).' } },
  { id: 'vc14', sk: 'long', s: 'With a little more effort, our class [could] [have] [won] the recycling contest.', ask: 'What could our class have done?', h: 'Won is the past form of win. Find the two helpers before it.', ex: 'Could and have help won. The whole team: could have won.', notes: { recycling: 'Recycling tells what kind of contest. It is not a verb here.', contest: 'Contest is a thing (an event).', effort: 'Effort is an idea (a noun).' } },
  { id: 'vc15', sk: 'endings', s: 'The barking dogs at the animal shelter [were] friendly and playful.', h: 'Does barking describe the dogs here? Find the BE word.', ex: 'Were is the verb. Barking describes the dogs, so it is not a verb here.', notes: { barking: 'Here barking describes the dogs. It is not a verb in this sentence.', friendly: 'Friendly describes the dogs. It is not a verb.', shelter: 'Shelter is a place (a noun).' } },
  { id: 'vc16', sk: 'endings', s: 'The frozen lake [sparkled] in the early morning sunlight.', ask: 'What did the lake do?', h: 'Frozen describes the lake. Which -ed word tells what the lake did?', ex: 'Sparkled is the verb. Frozen describes the lake.', notes: { frozen: 'Frozen describes the lake. It is not a verb in this sentence.', sunlight: 'Sunlight is a thing (a noun).', early: 'Early tells which part of the morning. It is not a verb.' } },
  { id: 'vc17', sk: 'endings', s: 'A spotted owl [swooped] silently over the empty field.', ask: 'What did the owl do?', h: 'Two words end in -ed. Which one tells what the owl did?', ex: 'Swooped is the verb. Spotted describes the owl.', notes: { spotted: 'Spotted describes the owl. The -ed ending does not make it a verb here.', silently: 'Silently tells HOW. It is an adverb, not a verb.', empty: 'Empty describes the field. It is not a verb.' } },
  { id: 'vc18', sk: 'multi', s: 'In the busy kitchen, the chef [chopped:a] onions, and his helper [stirred:b] the soup.', h: 'What did the chef do? What did the helper do?', ex: 'Chopped and stirred are both verbs.', notes: { and: 'And joins the two parts. It is not a verb.', onions: 'Onions are things (nouns).', helper: 'Helper names a person here. It is a noun.' } },
  { id: 'vc19', sk: 'multi', s: 'Lightning [flashed:a] while we [were:b] [eating:b] dinner in the kitchen.', h: 'Find one verb for the lightning and a verb team for we.', ex: 'Flashed is one verb. Were eating is a verb team.', notes: { while: 'While joins the two parts. It is not a verb.', dinner: 'Dinner is a thing (a meal).', lightning: 'Lightning is a thing (a noun).' } }
];
var HELPER_CHECK = [
  { id: 'hc1', sk: 'helpers', q: 'Finish the BE family: am, ___, are', c: ['has', 'is', 'do'], a: 1, h: 'am, ?, are', ex: 'am, IS, are.' },
  { id: 'hc2', sk: 'helpers', q: 'Which word is in the HAVE family?', c: ['hat', 'hid', 'had'], a: 2, h: 'have, has, ...', ex: 'have, has, HAD.' },
  { id: 'hc3', sk: 'helpers', q: 'Finish the chant: could, may, ___, must', c: ['might', 'make', 'more'], a: 0, h: 'It starts with m.', ex: 'could, may, MIGHT, must.' }
];

/* ───────────── VERB MASTERY CHALLENGE: 59 new sentences, used ONLY in the final assessment ───────────── */
var MASTERY_BENCHMARK = 54;
var MASTERY_CATS = [
  { id: 'action', name: 'Single action verbs (with describing words nearby)', count: 8, skill: 'action' },
  { id: 'being', name: 'Standalone being / having / doing verbs', count: 8, skill: 'being' },
  { id: 'team2', name: 'Two-word verb teams', count: 18, skill: 'team' },
  { id: 'team3', name: 'Three-word verb teams', count: 12, skill: 'long' },
  { id: 'between', name: 'Words between verb-team words', count: 8, skill: 'challenge' },
  { id: 'multi', name: 'More than one verb in a sentence', count: 5, skill: 'multi' }
];
var VERB_MASTERY = [
  { id: 'm1', cat: 'action', s: 'At the county fair, the smiling judge [pinned] a blue ribbon on the prize pig.', ex: 'Pinned is the only verb. Smiling describes the judge, so it is not a verb here. Prize tells what kind of pig.' },
  { id: 'm2', cat: 'action', s: 'The glowing lighthouse [guided] the small fishing boats safely into the harbor.', ex: 'Guided is the only verb. Glowing describes the lighthouse, fishing tells what kind of boats, and safely tells how.' },
  { id: 'm3', cat: 'action', s: 'At the pumpkin festival, Keisha proudly [carved] a grinning face with sparkling eyes.', ex: 'Carved is the only verb. Grinning describes the face, sparkling describes the eyes, and proudly tells how.' },
  { id: 'm4', cat: 'action', s: 'On the classroom television, the roaring rocket [zoomed] into the cloudy sky.', ex: 'Zoomed is the only verb. Roaring describes the rocket, so it is not a verb in this sentence.' },
  { id: 'm5', cat: 'action', s: 'Inside the crowded bakery, the baker gently [sprinkled] cinnamon over the warm, twisted rolls.', ex: 'Sprinkled is the only verb. Crowded and twisted end in -ed, but they describe the bakery and the rolls. Gently tells how.' },
  { id: 'm6', cat: 'action', s: 'At the museum, the gigantic dinosaur skeleton [towered] above the amazed visitors.', ex: 'Towered is the only verb. Amazed ends in -ed, but it describes the visitors.' },
  { id: 'm7', cat: 'action', s: 'Last winter, the spinning wind turbines [created] electricity for the whole town.', ex: 'Created is the only verb. Spinning describes the turbines, so it is not a verb here.' },
  { id: 'm8', cat: 'action', s: 'During the spelling bee, Andre nervously [spelled] the word "volcano" without a mistake.', ex: 'Spelled is the only verb. Spelling tells what kind of bee, so it is not a verb here. Nervously tells how.' },
  { id: 'm9', cat: 'being', s: 'After the long thunderstorm, the soccer field [was] muddy and full of puddles.', ex: 'Was is the only verb. Muddy and full describe the field.' },
  { id: 'm10', cat: 'being', s: 'The tallest sunflowers at the county fair [were] taller than my father.', ex: 'Were is the only verb. Tallest and taller are describing words, not verbs.' },
  { id: 'm11', cat: 'being', s: 'Our town\'s recycling center [is] open every Saturday morning until noon.', ex: 'Is is the only verb. Recycling tells what kind of center, and open describes the center here.' },
  { id: 'm12', cat: 'being', s: 'As the newest member of the chess club, I [am] a little nervous.', ex: 'Am is the only verb. Newest and nervous are describing words.' },
  { id: 'm13', cat: 'being', s: 'The museum\'s dinosaur skeleton [has] sharp teeth and a long, bony tail.', ex: 'Has is the main verb. No other verb comes after it, so has stands alone.' },
  { id: 'm14', cat: 'being', s: 'Both of my cousins [have] shiny medals from last year\'s swimming championship.', ex: 'Have is the main verb and stands alone. Swimming tells what kind of championship, so it is not a verb here.' },
  { id: 'm15', cat: 'being', s: 'At the pumpkin festival, Grandpa [did] a funny magic trick with three coins.', ex: 'Did is the main verb here. It stands alone and tells what Grandpa did.' },
  { id: 'm16', cat: 'being', s: 'Before the soccer tournament, our goalie [had] a sore wrist and a bruised knee.', ex: 'Had is the main verb and stands alone. Bruised ends in -ed, but it describes the knee.' },
  { id: 'm17', cat: 'team2', s: 'The volunteers [are] [sorting] plastic bottles and cardboard boxes at the recycling drive.', ex: 'The verb team: are sorting. Recycling tells what kind of drive, so it is not part of the team.' },
  { id: 'm18', cat: 'team2', s: 'Before the rocket launch, the astronauts [were] [waving] from the tiny round window.', ex: 'The verb team: were waving. Launch is a thing (an event) in this sentence.' },
  { id: 'm19', cat: 'team2', s: 'Our librarian [has] [arranged] hundreds of used books on long tables for the sale.', ex: 'The verb team: has arranged. Used ends in -ed, but it describes the books.' },
  { id: 'm20', cat: 'team2', s: 'The park rangers [had] [closed] the snowy mountain trail before the first blizzard.', ex: 'The verb team: had closed. Snowy describes the trail.' },
  { id: 'm21', cat: 'team2', s: 'The bakery [will] [open] an hour early on the morning of the festival.', ex: 'The verb team: will open. Early tells when, so it is not a verb.' },
  { id: 'm22', cat: 'team2', s: 'With a strong telescope, you [can] [see] the rings around the planet Saturn.', ex: 'The verb team: can see. Rings is a thing here.' },
  { id: 'm23', cat: 'team2', s: 'Tonight, the howling thunderstorm [could] [knock] branches onto the power lines.', ex: 'The verb team: could knock. Howling describes the thunderstorm, so it is not a verb here.' },
  { id: 'm24', cat: 'team2', s: 'Visitors [may] [touch] the smooth fossil eggs in the dinosaur hall.', ex: 'The verb team: may touch. Smooth describes the eggs.' },
  { id: 'm25', cat: 'team2', s: 'The lighthouse keeper [must] [climb] one hundred winding steps every single evening.', ex: 'The verb team: must climb. Winding describes the steps, so it is not a verb here.' },
  { id: 'm26', cat: 'team2', s: 'Our coach [might] [cancel] the soccer tournament because of the flashing lightning.', ex: 'The verb team: might cancel. Flashing describes the lightning.' },
  { id: 'm27', cat: 'team2', s: 'In this year\'s spelling bee, Brianna [should] [win] the shiny gold trophy.', ex: 'The verb team: should win. Spelling tells what kind of bee, so it is not a verb here.' },
  { id: 'm28', cat: 'team2', s: 'The judges [shall] [announce] the winner of the pumpkin contest at noon.', ex: 'The verb team: shall announce. Winner and contest are nouns.' },
  { id: 'm29', cat: 'team2', s: 'My little brother [would] [love] a ride on the antique fire truck.', ex: 'The verb team: would love. Ride is a thing here, because it comes after a.' },
  { id: 'm30', cat: 'team2', s: 'I [am] [counting] the dimes in our class jar for the animal shelter.', ex: 'The verb team: am counting. Am helps counting.' },
  { id: 'm31', cat: 'team2', s: 'The museum guide [was] [pointing] at the huge, curved claws of the skeleton.', ex: 'The verb team: was pointing. Curved ends in -ed, but it describes the claws.' },
  { id: 'm32', cat: 'team2', s: 'The noisy geese [have] [returned] to the frozen pond behind the lighthouse.', ex: 'The verb team: have returned. Frozen describes the pond.' },
  { id: 'm33', cat: 'team2', s: 'My grandfather [does] [enjoy] the crunchy apple fritters from the corner bakery.', ex: 'The verb team: does enjoy. Does is a helper here, and crunchy describes the fritters.' },
  { id: 'm34', cat: 'team2', s: 'Surprisingly, the tiny pumpkin seeds [did] [sprout] after the warm spring rain.', ex: 'The verb team: did sprout. Did is a helper here. Surprisingly is not a verb.' },
  { id: 'm35', cat: 'team3', s: 'The excited crowd [has] [been] [cheering] since the start of the countdown.', ex: 'The verb team: has been cheering. Excited ends in -ed, but it describes the crowd.' },
  { id: 'm36', cat: 'team3', s: 'The bakers [will] [be] [frosting] pumpkin cookies all night before the festival.', ex: 'The verb team: will be frosting. Will and be are helpers, and frosting is the main verb.' },
  { id: 'm37', cat: 'team3', s: 'The brave firefighters [had] [been] [battling] the forest fire for three long days.', ex: 'The verb team: had been battling. Fire is a thing in this sentence.' },
  { id: 'm38', cat: 'team3', s: 'Our class [should] [have] [saved] more paper bags for the recycling drive.', ex: 'The verb team: should have saved. Recycling tells what kind of drive, so it is not a verb here.' },
  { id: 'm39', cat: 'team3', s: 'A huge hailstorm [might] [be] [heading] toward our town this afternoon.', ex: 'The verb team: might be heading. Huge describes the hailstorm.' },
  { id: 'm40', cat: 'team3', s: 'The famous skeleton [must] [have] [belonged] to a gigantic, hungry dinosaur.', ex: 'The verb team: must have belonged. Gigantic and hungry describe the dinosaur.' },
  { id: 'm41', cat: 'team3', s: 'Without the fog, the sailors [could] [have] [seen] the lighthouse beam much sooner.', ex: 'The verb team: could have seen. Sooner tells when, so it is not a verb.' },
  { id: 'm42', cat: 'team3', s: 'The library volunteers [have] [been] [selling] old books since early this morning.', ex: 'The verb team: have been selling. Early tells when.' },
  { id: 'm43', cat: 'team3', s: 'By Saturday, our team [will] [have] [played] nine games in the soccer tournament.', ex: 'The verb team: will have played. Will and have are helpers, and played is the main verb.' },
  { id: 'm44', cat: 'team3', s: 'Grandma [would] [have] [baked] extra cherry pies for the library fundraiser.', ex: 'The verb team: would have baked. Extra describes the pies.' },
  { id: 'm45', cat: 'team3', s: 'Last night, a hungry raccoon [may] [have] [dragged] our recycling bin into the street.', ex: 'The verb team: may have dragged. Recycling tells what kind of bin, so it is not a verb here.' },
  { id: 'm46', cat: 'team3', s: 'The museum workers [had] [been] [cleaning] the dinosaur bones with tiny brushes.', ex: 'The verb team: had been cleaning. Brushes is a thing here.' },
  { id: 'm47', cat: 'between', s: 'The rocket [has] not [left] the ground because of the gusty winds.', ex: 'The verb words: has left. Not sits between them, but not is never a verb.' },
  { id: 'm48', cat: 'between', s: 'The bakery [had] already [sold] every blueberry muffin before eight o\'clock.', ex: 'The verb words: had sold. Already tells when, so it is not a verb.' },
  { id: 'm49', cat: 'between', s: 'The lighthouse beam [was] still [shining] brightly through the thick gray fog.', ex: 'The verb words: was shining. Still and brightly are not verbs.' },
  { id: 'm50', cat: 'between', s: '[Did] the scientists [find] any dinosaur eggs near the old riverbank?', ex: 'The verb words: did find. In a question, the helper comes first, and the scientists sit between the verb words.' },
  { id: 'm51', cat: 'between', s: 'The nervous speller [could] barely [hear] the word over the buzzing fan.', ex: 'The verb words: could hear. Barely is not a verb, and buzzing describes the fan.' },
  { id: 'm52', cat: 'between', s: 'My cousin [will] never [forget] the giant pumpkin at the harvest festival.', ex: 'The verb words: will forget. Never is not a verb.' },
  { id: 'm53', cat: 'between', s: 'The patient fisherman [was] quietly [waiting] for a bite on the foggy pier.', ex: 'The verb words: was waiting. Quietly tells how, and bite is a thing here because it comes after a.' },
  { id: 'm54', cat: 'between', s: '[Can] the firefighters [rescue] the stranded kitten from the tall oak tree?', ex: 'The verb words: can rescue. In a question, the helper comes first. Stranded ends in -ed, but it describes the kitten.' },
  { id: 'm55', cat: 'multi', s: 'The referee [blew:a] her whistle, so the players [walked:b] off the slippery field.', ex: 'Blew and walked are both verbs. So joins the two parts, and slippery describes the field.' },
  { id: 'm56', cat: 'multi', s: 'While the band [was:a] [playing:a], the bakers [served:b] warm apple cider to the crowd.', ex: 'Was playing is one verb team, and served is another verb. While joins the two parts.' },
  { id: 'm57', cat: 'multi', s: 'The rocket [shook:a] the ground when its huge engines [roared:b] to life.', ex: 'Shook is one verb, and roared is another verb. When joins the two parts.' },
  { id: 'm58', cat: 'multi', s: 'The museum [will:a] [close:a] early because the workers [are:b] [repairing:b] the roof.', ex: 'Will close is one verb team, and are repairing is another verb team. Because joins them.' },
  { id: 'm59', cat: 'multi', s: 'Before the spelling bee [started:a], Zara [practiced:b] her hardest words with her grandmother.', ex: 'Started and practiced are both verbs. Spelling tells what kind of bee, so it is not a verb here.' }
];

/* ───────────── CHECK MY SKILLS banks (separate from lessons and practice) ───────────── */
var NOUN_CHECK = [
  { id: 'nc1', sk: 'multi', s: '[Zora:pP] found an [arrowhead:t] near the [creek:l] behind her [house:l].', h: 'Who found it? What did she find? Where was it? There are two places.', ex: 'Zora is a person. Arrowhead is a thing. Creek and house are places.', notes: { her: 'Her tells whose house. It is not a noun.' } },
  { id: 'nc2', sk: 'multi', s: 'At the [festival:t], a [juggler:p] tossed [pumpkins:t] high into the [air:t].', h: 'Find the event, the person, what he tossed, and where they went.', ex: 'Festival is an event, so it is a thing. Juggler is a person. Pumpkins and air are things.', notes: { high: 'High tells where the pumpkins went. It is an adverb, not a noun.' } },
  { id: 'nc3', sk: 'people', s: 'The [mechanic:p] showed my [uncle:p] a flat [tire:t] on his [truck:t].', want: 'p', h: 'Who showed something, and who saw it?', ex: 'Mechanic and uncle name people. Tire and truck are things.', notes: { flat: 'Flat describes the tire. It is an adjective.', my: 'My tells whose uncle. It is not a noun.' } },
  { id: 'nc4', sk: 'places', s: 'The [ducklings:t] waddled from the [marsh:l] to a sunny [meadow:l] near the [farmhouse:l].', want: 'l', h: 'Where did the ducklings start, and where did they go? Look for three places.', ex: 'Marsh, meadow, and farmhouse name places. Ducklings are animals, so they are things.', notes: { sunny: 'Sunny describes the meadow. It is an adjective.' } },
  { id: 'nc5', sk: 'things', s: '[Tyrone:pP] filled a [bucket:t] with [seeds:t] for the hungry [chickens:t].', want: 't', h: 'What did Tyrone fill? What did he put in it? Who ate it?', ex: 'Bucket and seeds are things. Chickens are animals, so they are things too. Tyrone is a person.', notes: { hungry: 'Hungry describes the chickens. It is an adjective.' } },
  { id: 'nc6', sk: 'proper', s: 'In [March:tP], [Priya:pP] wrote a [report:t] about [Georgia:lP] and its [rivers:l].', want: 'P', h: 'Look for a month, a girl’s name, and a state. They start with capital letters.', ex: 'March, Priya, and Georgia are special names, so they are proper nouns. Report and rivers are common nouns.', notes: { its: 'Its tells whose rivers. It is not a noun.' } },
  { id: 'nc7', sk: 'proper', s: 'On [Friday:tP], [Ruby:pP] brought her [hamster:t] [Peanut:tP] to [school:l] in a small [cage:t].', want: 'c', h: 'Common nouns are not special names. There are three.', ex: 'Hamster, school, and cage are common nouns. Friday, Ruby, and Peanut are special names, so they are proper nouns.', notes: { her: 'Her tells whose hamster. It is not a noun.', small: 'Small describes the cage. It is an adjective.' } },
  { id: 'nc8', sk: 'ideas', s: 'Before the big [game:t], our [coach:p] taught the [team:p] about [honesty:i] and [respect:i].', want: 'i', h: 'What did the coach teach about? Look for two ideas.', ex: 'Honesty and respect name ideas. Coach is a person, team is a group of people, and game is an event (a thing).', notes: { our: 'Our tells whose coach. It is not a noun.', big: 'Big describes the game. It is an adjective.' } },
  { id: 'nc9', sk: 'ideas', s: '[Jordan:pP] felt [pride:i] when his [poem:t] won a [prize:t] at the [fair:t].', want: 'i', h: 'Which noun names a feeling?', ex: 'Pride names a feeling, which is an idea. Jordan is a person. Poem and prize are things, and the fair is an event.', notes: { his: 'His tells whose poem. It is not a noun.' } },
  { id: 'nc10', sk: 'multi', s: 'The [mayor:p] cut a [ribbon:t] to open the new [playground:l] beside the [courthouse:l].', h: 'Find the person, the thing she cut, and two places.', ex: 'Mayor is a person. Ribbon is a thing. Playground and courthouse are places.', notes: { new: 'New describes the playground. It is an adjective.', open: 'Open is an action word, a verb. It is not a noun.' } },
{ id: 'nc11', sk: 'people', s: 'The [baker:p] pulled warm [rolls:t] from the [oven:t].', want: 'p', h: 'Who pulled the rolls out?', h2: 'Ask "who?"', ex: 'Baker names a person. Rolls and oven are things.' },
  { id: 'nc12', sk: 'places', s: 'Our [team:p] practiced at the [stadium:l] on [Monday:tP].', want: 'l', h: 'Where did the team practice?', h2: 'Ask "where?"', ex: 'Stadium names a place. Team names people and Monday names a day.' },
  { id: 'nc13', sk: 'things', s: 'The [nurse:p] gave me a [bandage:t].', want: 't', h: 'What did the nurse give?', h2: 'Find the object.', ex: 'Bandage names a thing. Nurse names a person.', notes: { me: 'Me is a pronoun. It stands in for a noun, so we do not tap it here.' } }
];
var ADJ_CHECK = [
  { id: 'ac1', sk: 'kind', s: 'The [bumpy@road] road led to a [peaceful@farm] farm in the country.', h: 'What kind of road? What kind of farm?', ex: 'Bumpy describes road. Peaceful describes farm.' },
  { id: 'ac2', sk: 'kind', s: 'Leon carried a [heavy@backpack] backpack up the [steep@hill] hill behind his house.', h: 'What kind of backpack? What kind of hill?', ex: 'Heavy describes backpack. Steep describes hill.' },
  { id: 'ac3', sk: 'many', s: 'Our team scored [eleven@runs] runs in the game against the Tigers.', h: 'How many runs did our team score?', ex: 'Eleven tells how many runs.' },
  { id: 'ac4', sk: 'many', s: '[Many@neighbors] neighbors came to help clean the park after the flood.', h: 'How many neighbors came?', ex: 'Many tells how many neighbors.' },
  { id: 'ac5', sk: 'which', s: 'Jalen solved the [final@puzzle] puzzle in the book before dinner.', h: 'Which puzzle did Jalen solve?', ex: 'Final tells which puzzle.' },
  { id: 'ac6', sk: 'which', s: 'Our cousins from Ohio will visit us at the beach [next@month] month.', h: 'Which month will our cousins visit?', ex: 'Next tells which month.' },
  { id: 'ac7', sk: 'after', s: 'The [ripe@peaches] peaches smelled [sweet@peaches] in the [warm@kitchen] kitchen.', h: 'Two words describe the peaches. One word describes the kitchen.', ex: 'Ripe and sweet describe peaches. Sweet comes after smelled. Warm describes kitchen.' },
  { id: 'ac8', sk: 'after', s: 'After the rain on Tuesday, the playground was [wet@playground] and [slippery@playground].', h: 'Find the noun playground. What was it like after the rain?', ex: 'Wet and slippery describe playground. They come after was.' },
  { id: 'ac9', sk: 'multi', s: '[Two@hummingbirds] hummingbirds sipped from the [red@flowers] flowers near our [sunny@porch] porch.', h: 'How many hummingbirds? What kind of flowers? What kind of porch?', ex: 'Two describes hummingbirds. Red describes flowers. Sunny describes porch.' },
  { id: 'ac10', sk: 'multi', s: 'The [clever@fox] fox crept past [seven@hens] hens in the [dark@barn] barn.', h: 'Check the fox, the hens, and the barn.', ex: 'Clever describes fox. Seven tells how many hens. Dark describes barn.' }
];
var ADV_CHECK = [
  { id: 'dc1', sk: 'how', s: 'The puppy splashed [happily@splashed:how] in the puddles after the storm.', h: 'How did the puppy splash?', ex: 'Happily tells HOW the puppy splashed.' },
  { id: 'dc2', sk: 'how', s: 'Tanisha whispered [softly@whispered:how] to her sleeping baby brother during the long ride.', h: 'How did Tanisha whisper?', ex: 'Softly tells HOW Tanisha whispered.', notes: { sleeping: 'Sleeping describes her brother, a noun. It is not an adverb.' } },
  { id: 'dc3', sk: 'how', s: 'The relay team passed the baton [smoothly@passed:how] during the race.', h: 'How did the team pass the baton?', ex: 'Smoothly tells HOW the team passed the baton.' },
  { id: 'dc4', sk: 'when', s: 'We will visit our aunt and uncle in Savannah [tomorrow@visit:when].', h: 'When will we visit our aunt?', ex: 'Tomorrow tells WHEN we will visit.' },
  { id: 'dc5', sk: 'when', s: '[Afterward@ate:when], the whole family ate peach cobbler on the porch.', h: 'When did the family eat cobbler?', ex: 'Afterward tells WHEN the family ate.', notes: { whole: 'Whole describes the family, a noun. It is an adjective.' } },
  { id: 'dc6', sk: 'when', s: '[Tonight@sleep:when], the campers will sleep [outside@sleep:where] under the stars.', want: 'when', h: 'Two words describe sleep. Which one tells WHEN?', ex: 'Tonight tells WHEN the campers will sleep. Outside is an adverb too, but it tells WHERE.' },
  { id: 'dc7', sk: 'where', s: 'The excited children raced [downstairs@raced:where] to open their presents.', h: 'Where did the children race?', ex: 'Downstairs tells WHERE the children raced.', notes: { excited: 'Excited describes the children, a noun. It is an adjective.' } },
  { id: 'dc8', sk: 'where', s: 'The curious kitten climbed [upstairs@climbed:where] and hid under the bed.', h: 'Where did the kitten climb?', ex: 'Upstairs tells WHERE the kitten climbed.', notes: { curious: 'Curious describes the kitten, a noun. It is an adjective.' } },
  { id: 'dc9', sk: 'compare', k: 'mc', q: 'Which sentence uses an ADVERB?', c: ['The kind nurse smiled at me.', 'The nurse smiled kindly at me.', 'The nurse was kind to me.'], a: 1, h: 'Find the word that tells how the nurse smiled.', ex: 'Kindly describes smiled, a verb, so it is an adverb. Kind describes the nurse, so it is an adjective.' },
  { id: 'dc10', sk: 'compare', k: 'mc', q: 'On the chilly morning, the friendly librarian read to us early.\nWhich word is an ADVERB?', c: ['chilly', 'friendly', 'early'], a: 2, h: 'Find the verb read. Which word tells when she read?', ex: 'Early tells when the librarian read, so it is an adverb. Chilly describes morning and friendly describes librarian, so they are adjectives, even though they end in -ly.' }
];
var VOWEL_CHECK = [
  { id: 'oc1', sk: 'letters', k: 'mc', q: 'Which word has TWO vowel letters?', c: ['frog', 'train', 'milk'], a: 1, h: 'Look for a, e, i, o, u in each word.', ex: 'Train has two vowel letters: a and i. Frog and milk have one each.' },
  { id: 'oc2', sk: 'short', k: 'mc', q: 'Which word has the same vowel sound as sun?', c: ['mud', 'mule', 'moon'], a: 0, h: 'Sun has a short u.', ex: 'Mud has short u, like sun (one vowel between consonants).' },
  { id: 'oc3', sk: 'short', k: 'mc', q: 'Which word has a short e sound?', c: ['wheel', 'web', 'wade'], a: 1, h: 'Find one e between two consonants.', ex: 'Web has the short e pattern w-e-b.' },
  { id: 'oc4', sk: 'long', k: 'mc', q: 'Which word has a long o spelled with silent e?', c: ['road', 'rob', 'rope'], a: 2, h: 'Two words may have long o; only one ends in e.', ex: 'Rope uses silent e. Road has long o too, but it uses the team oa.' },
  { id: 'oc5', sk: 'silente', k: 'mc', q: 'Add a silent e to pin. What new word do you make?', c: ['pins', 'pine', 'pint'], a: 1, h: 'Write pin, then put e at the end.', ex: 'pin + e = pine. The i now says its name.' },
  { id: 'oc6', sk: 'silente', k: 'mc', q: 'In the word cube, what does the u usually say?', c: ['its name (long u)', 'short u, like in cub'], a: 0, h: 'Cube ends with silent e.', ex: 'The silent e in cube helps the u say its name.' },
  { id: 'oc7', sk: 'teams', k: 'mc', q: 'Which word has the same vowel team as rain and tail?', c: ['snack', 'snail', 'snore'], a: 1, h: 'Rain and tail both have ai.', ex: 'Snail has the team ai, just like rain and tail.' },
  { id: 'oc8', sk: 'teams', k: 'mc', q: 'Which word has a vowel team that says long e?', c: ['shop', 'ship', 'sheep'], a: 2, h: 'Look for two vowels side by side.', ex: 'Sheep has ee, which says long e.' },
  { id: 'oc9', sk: 'long', k: 'sort', q: 'How is the long vowel spelled? Sort each word.', b: ['Silent e', 'Vowel team'], items: [['note', 0], ['soap', 1], ['lake', 0], ['paid', 1], ['mule', 0], ['leaf', 1]], h: 'Does the word end in e, or have two vowels together?', ex: 'note, lake, mule use silent e. soap, paid, leaf use vowel teams.' },
  { id: 'oc10', sk: 'teams', k: 'mc', q: 'Which word fits and has the team oa?\n“I washed my hands with ___.”', c: ['sap', 'soap', 'soup'], a: 1, h: 'Which word makes sense AND has o and a together?', ex: 'Soap makes sense and has the team oa.' },
{ id: 'oc11', sk: 'letters', k: 'mc', q: 'Which word has the vowel letter i?', c: ['ship', 'shop', 'shut'], a: 0, h: 'Look at the middle letter.', h2: 'Name the vowel in each word.', ex: 'Ship has the vowel letter i.' }
];
/* Reading check passages: used ONLY in Check My Skills, never in lessons, guided practice, or practice. */
var CHECK_PASSAGES = [
  {
    "id": "cp1",
    "title": "Honeybees at Work",
    "type": "Nonfiction",
    "topic": "Insects",
    "paras": [
      [
        "A single honeybee hive can be home to thousands of bees, and almost every one of them has a job.",
        "Most of the bees are female worker bees.",
        "Some workers clean the hive, some feed the young bees, and others guard the entrance.",
        "The oldest workers become foragers, which are bees that fly out to search for food."
      ],
      [
        "A forager visits flower after flower, sipping a sugary liquid called nectar through its long tongue.",
        "She stores the nectar in a special stomach and carries it home to the hive.",
        "There, younger bees take the nectar and spread it into the wax cells of the honeycomb.",
        "The bees fan their wings to dry out the extra water, and the nectar slowly thickens into honey.",
        "Finally, they seal each cell with a thin cap of wax so the honey stays clean until the bees need it."
      ],
      [
        "Foragers also share news with one another.",
        "When a bee finds a good patch of flowers, she returns to the hive and performs a waggle dance on the honeycomb.",
        "The direction and length of her dance tell the other bees which way to fly and how far to go."
      ],
      [
        "While honeybees gather food, they help plants, too.",
        "Tiny grains of pollen stick to a bee’s fuzzy body, and some of that pollen rubs off on the next flower she visits.",
        "This process, called pollination, helps many plants make seeds and fruit, such as apples and blueberries."
      ]
    ],
    "qs": [
      {
        "id": "cp1q1",
        "sk": "main",
        "q": "What is this passage mostly about?",
        "c": [
          "The oldest worker bees fly out to search for food.",
          "Bees fan their wings to turn nectar into honey.",
          "How honeybees work together to make honey and help plants",
          "Insects help people in many different ways"
        ],
        "a": 2,
        "h": "Think about what EVERY paragraph tells about, not just one.",
        "h2": "The paragraphs tell about bee jobs, making honey, sharing news, and helping plants. The main idea is the one that covers all four.",
        "ex": "The paragraphs tell about bee jobs, how bees make honey, how they share news, and how they help plants. All of it shows bees working together.",
        "why": [
          "This is true, but it is one detail from the first paragraph.",
          "This is true, but it is one step in the second paragraph.",
          null,
          "This is too big. The passage only tells about honeybees."
        ]
      },
      {
        "id": "cp1q2",
        "sk": "detail",
        "q": "According to the passage, what do the OLDEST worker bees do?",
        "c": [
          "Guard the entrance of the hive",
          "Feed the young bees",
          "Fly out to search for food",
          "Spread nectar into the wax cells"
        ],
        "a": 2,
        "h": "Find the word oldest in the first paragraph.",
        "h2": "The first paragraph lists many jobs, but only one sentence names the oldest workers. Read that sentence to the end.",
        "ex": "The passage says: “The oldest workers become foragers, which are bees that fly out to search for food.”",
        "why": [
          "Some workers guard the entrance, but the passage does not say they are the oldest.",
          "Some workers feed young bees, but the passage does not say they are the oldest.",
          null,
          "The passage says YOUNGER bees spread the nectar into the cells."
        ]
      },
      {
        "id": "cp1q3",
        "sk": "sequence",
        "q": "After the nectar thickens into honey, what do the bees do NEXT?",
        "c": [
          "They fan their wings to dry out the water.",
          "They spread the nectar into the wax cells.",
          "They seal each cell with a cap of wax.",
          "They perform a waggle dance."
        ],
        "a": 2,
        "h": "Find the sentence about the nectar turning into honey. The next sentence starts with a signal word.",
        "h2": "Fanning and spreading are steps that make the honey. The question asks what happens once the honey is already made.",
        "ex": "The next sentence says: “Finally, they seal each cell with a thin cap of wax.”",
        "why": [
          "Fanning happens BEFORE the nectar turns into honey.",
          "Spreading the nectar happens even earlier.",
          null,
          "The waggle dance is about sharing news of flowers, in a different paragraph."
        ]
      },
      {
        "id": "cp1q4",
        "sk": "vocab",
        "q": "What does the word seal mean in this passage?",
        "c": [
          "A sea animal with flippers",
          "To close something up tightly",
          "To fill something with nectar",
          "To dry something with wind"
        ],
        "a": 1,
        "h": "Read the whole sentence. The bees put a cap of wax on each cell so the honey stays clean.",
        "h2": "A cap goes on top of something, like the lid on a jar. Think about what a lid does.",
        "ex": "The bees cover each cell with a wax cap so the honey stays clean. To seal means to close something up tightly.",
        "why": [
          "Seal can name an animal, but here the bees seal the cells with wax.",
          null,
          "The cells were filled with nectar earlier. Sealing comes after.",
          "Fanning their wings dries the nectar. That is a different step."
        ]
      },
      {
        "id": "cp1q5",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that tells how a honeybee shows other bees where to find flowers.",
        "ok": [
          10,
          11
        ],
        "h": "Look in the paragraph about how foragers share news.",
        "h2": "Look for a sentence about the dance, and what the dance tells the other bees.",
        "ex": "The bee performs a waggle dance, and the direction and length of the dance tell the other bees which way to fly and how far to go."
      }
    ]
  },
  {
    "id": "cp2",
    "title": "A Sign That Stayed Put",
    "type": "Fiction",
    "topic": "Solving a problem with help",
    "paras": [
      [
        "Brielle wanted to raise money for the animal shelter on Peachtree Avenue, so she set up a lemonade stand in her front yard.",
        "She had painted a bright poster that said, “Lemonade for Puppies, Fifty Cents.”",
        "But a strong breeze kept blowing the poster off her table and into the street.",
        "Each time she chased it, she had to leave her stand alone."
      ],
      [
        "By noon, Brielle had sold only three cups, and her poster was wrinkled and muddy.",
        "She sat on the curb with her chin in her hands, feeling discouraged.",
        "Her neighbor, Mr. Haddad, was trimming his hedges next door, and he noticed her slumped shoulders.",
        "“Having a tough day?” he asked kindly."
      ],
      [
        "Brielle explained the problem with her poster.",
        "Mr. Haddad thought for a moment, and then he went into his garage.",
        "He came back with an old wooden easel, two metal clamps, and a roll of clear tape.",
        "Together, they taped the torn corners of the poster and clamped it tightly to the easel.",
        "Then Mr. Haddad placed two heavy bricks against the bottom of the easel so the wind could not tip it over."
      ],
      [
        "The poster stayed put all afternoon, and people driving by could finally read it.",
        "By five o’clock, Brielle had sold forty cups of lemonade and earned twenty dollars for the shelter.",
        "She ran next door with her jar of coins to show Mr. Haddad.",
        "“I couldn’t have done it without you,” she said, grinning."
      ]
    ],
    "qs": [
      {
        "id": "cp2q1",
        "sk": "problem",
        "q": "What problem did Brielle have at her lemonade stand?",
        "c": [
          "She did not have enough lemonade to sell.",
          "The wind kept blowing her poster away, so she had to leave her stand.",
          "Her poster was too small for drivers to read.",
          "The animal shelter did not want her money."
        ],
        "a": 1,
        "h": "Read the first paragraph. What kept happening to her poster?",
        "h2": "The first paragraph has the word But. It shows where things started going wrong for Brielle.",
        "ex": "A strong breeze kept blowing her poster off the table and into the street, and she had to leave her stand to chase it.",
        "why": [
          "She had plenty. She sold forty cups by five o’clock.",
          null,
          "Drivers could not read it because it kept blowing away, not because it was small.",
          "The story never says that. She was raising money FOR the shelter."
        ]
      },
      {
        "id": "cp2q2",
        "sk": "sequence",
        "q": "What did Mr. Haddad do right after he went into his garage?",
        "c": [
          "He asked Brielle if she was having a tough day.",
          "He placed two heavy bricks against the easel.",
          "He came back with an easel, clamps, and tape.",
          "He taped the torn corners of the poster."
        ],
        "a": 2,
        "h": "Find the sentence about the garage. Then read the very next sentence.",
        "h2": "He went into the garage to get something. He had to bring the tools out before he could use them.",
        "ex": "The next sentence says: “He came back with an old wooden easel, two metal clamps, and a roll of clear tape.”",
        "why": [
          "He asked that BEFORE he went to the garage.",
          "He did that last, after they clamped the poster to the easel.",
          null,
          "They taped the poster after he brought the tape back."
        ]
      },
      {
        "id": "cp2q3",
        "sk": "theme",
        "q": "What lesson does this story show?",
        "c": [
          "Brielle sells forty cups of lemonade for the animal shelter.",
          "When you are stuck, help from someone else can make a big difference.",
          "You should always solve your problems all by yourself.",
          "Lemonade stands work best on windy days."
        ],
        "a": 1,
        "h": "Read what Brielle says at the very end. What does she understand now?",
        "h2": "A lesson is a message you could use in your own life. Think about how Brielle’s day changed after her neighbor stepped in.",
        "ex": "Brielle was ready to give up, but Mr. Haddad helped her fix the poster. She says, “I couldn’t have done it without you.” The lesson is that help can make a big difference.",
        "why": [
          "This tells what happened. It is a summary, not a lesson.",
          null,
          "Brielle could not fix it alone. Getting help is what worked.",
          "The wind caused her problem, so windy days did not help."
        ]
      },
      {
        "id": "cp2q4",
        "sk": "inference",
        "q": "Why did Brielle most likely sell many more cups in the afternoon?",
        "c": [
          "Mr. Haddad bought most of the lemonade.",
          "Her poster stayed up, so people could see what she was selling.",
          "She lowered the price of each cup.",
          "It got hotter, so more people were outside."
        ],
        "a": 1,
        "h": "Clue: read the first sentence of the last paragraph. What do you know about how signs help a stand?",
        "h2": "The story tells one thing that changed between the morning and the afternoon. Think about how that change would help people who were driving by.",
        "ex": "The poster stayed put, and people driving by could finally read it. When people can see a sign, more of them stop to buy.",
        "why": [
          "Mr. Haddad helped with the poster. The story never says he bought lemonade.",
          null,
          "The price never changes in the story.",
          "The story never says the weather got hotter."
        ]
      },
      {
        "id": "cp2q5",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that proves the poster problem was solved.",
        "ok": [
          13,
          14
        ],
        "h": "Look in the last paragraph. What happened after they fixed the poster?",
        "h2": "Look for a sentence that shows the poster stayed up, or a result that could only happen once people could read it.",
        "ex": "The poster stayed put all afternoon, and Brielle sold forty cups. Both sentences show the problem was solved."
      }
    ]
  },
  {
    "id": "cp3",
    "title": "How a Hurricane Forms",
    "type": "Nonfiction",
    "topic": "Weather",
    "paras": [
      [
        "A hurricane is a huge, spinning storm with strong winds and heavy rain.",
        "Some hurricanes are so wide that they could cover the whole state of Georgia.",
        "But hurricanes cannot form just anywhere.",
        "They need warm ocean water to get started."
      ],
      [
        "In the Atlantic Ocean, most hurricanes form in late summer or early fall, when the water is warmest.",
        "First, the sun heats the ocean, and warm, wet air rises from the water.",
        "As the air goes up, it cools and forms tall clouds and thunderstorms.",
        "Then more air rushes in near the water to take the place of the air that rose.",
        "Because the Earth spins, this moving air starts to turn in a giant circle.",
        "When the winds reach 74 miles per hour or faster, scientists call the storm a hurricane."
      ],
      [
        "The center of a hurricane is called the eye.",
        "Inside the eye, the air is calm, and sometimes you can even see blue sky.",
        "But the strongest winds whirl in a ring of storms right around the eye."
      ],
      [
        "Warm ocean water is like fuel for a hurricane.",
        "When a hurricane moves over land, it loses that warm water, so it slowly grows weaker.",
        "Scientists use satellites and special airplanes to track hurricanes, so they can warn people to get ready."
      ]
    ],
    "qs": [
      {
        "id": "cp3q1",
        "sk": "main",
        "q": "What is this passage mostly about?",
        "c": [
          "The calm eye in the center of a hurricane",
          "How scientists use airplanes to track storms",
          "How hurricanes form, grow strong, and then get weaker",
          "All the different kinds of weather on Earth"
        ],
        "a": 2,
        "h": "Look at the title. Then ask: what do most of the paragraphs explain?",
        "h2": "One paragraph tells how the storm starts, one tells about the eye, and one tells what makes it weaker. The main idea covers the whole life of the storm.",
        "ex": "The passage explains how a hurricane starts over warm water, how its winds get strong, what its center is like, and why it gets weaker over land.",
        "why": [
          "This is true, but it is only the third paragraph.",
          "This is true, but it is only the last sentence.",
          null,
          "This is too big. The passage only tells about hurricanes."
        ]
      },
      {
        "id": "cp3q2",
        "sk": "sequence",
        "q": "What happens right after the warm air rises and forms thunderstorms?",
        "c": [
          "The sun heats the ocean water.",
          "More air rushes in near the water to take its place.",
          "The storm moves over land and grows weaker.",
          "The winds reach 74 miles per hour."
        ],
        "a": 1,
        "h": "Find the sentence about clouds and thunderstorms in the second paragraph. Read the next sentence.",
        "h2": "The second paragraph uses the signal words First and Then. Find the step that starts with Then.",
        "ex": "The passage says: “Then more air rushes in near the water to take the place of the air that rose.”",
        "why": [
          "The sun heats the water FIRST, before the air rises.",
          null,
          "That happens near the end of a hurricane’s life, in the last paragraph.",
          "That happens later, after the air starts to spin."
        ]
      },
      {
        "id": "cp3q3",
        "sk": "vocab",
        "q": "What does the word fuel mean in this passage?",
        "c": [
          "A kind of big ocean wave",
          "Something that makes a storm calm",
          "Something that gives a thing the power to keep going",
          "A tool that scientists use to track storms"
        ],
        "a": 2,
        "h": "Read the next sentence. What happens to a hurricane when it loses warm water?",
        "h2": "Without warm water, the hurricane grows weaker. So warm water must be what keeps it strong, the way gas keeps a car running.",
        "ex": "Warm water keeps a hurricane going, and without it the storm gets weaker. Fuel is something that gives a thing the power to keep going.",
        "why": [
          "The passage does not talk about waves.",
          "Warm water makes a hurricane STRONGER, not calm.",
          null,
          "Satellites and airplanes are the tools. Fuel is the warm water."
        ]
      },
      {
        "id": "cp3q4",
        "sk": "inference",
        "q": "When the eye of a hurricane passes over a town, why might people think the storm is over?",
        "c": [
          "The eye is where the hurricane first starts.",
          "The air in the eye is calm, even though strong winds are close by.",
          "The eye has the strongest winds of all.",
          "Hurricanes only last for a few minutes."
        ],
        "a": 1,
        "h": "Read the third paragraph. What is the weather like inside the eye?",
        "h2": "Inside the eye, the air is calm and the sky may be blue. Then think about what is waiting in the ring right around the eye.",
        "ex": "The eye is calm, and sometimes the sky is blue, so it can seem like the storm has ended. But the strongest winds are in the ring around the eye, so the storm is not over.",
        "why": [
          "A hurricane starts over warm ocean water, not in a town.",
          null,
          "The strongest winds are AROUND the eye, not inside it.",
          "The passage never says hurricanes are that short."
        ]
      },
      {
        "id": "cp3q5",
        "sk": "evidence",
        "k": "ev",
        "q": "Tap a sentence that tells why a hurricane gets weaker over land.",
        "ok": [
          13,
          14
        ],
        "h": "Look in the last paragraph for the word land.",
        "h2": "Look for a sentence about what a hurricane needs, or what it loses when it leaves the ocean.",
        "ex": "“When a hurricane moves over land, it loses that warm water, so it slowly grows weaker.” The sentence before it explains that warm water is the hurricane’s fuel."
      }
    ]
  }
];
/* ===== GRADE 3 ADDITIONS START ===== */

var LESSONS_ADD_GRAMMAR = {
  adjectives: [
    { id: "F", title: "Adjectives After Linking Verbs", skill: "after", key: "An adjective can come after a linking verb and still describe the noun.", steps: [
      { t: "explain", title: "Adjectives can come after", text: ["Most adjectives come right before a noun.", "An adjective can also come AFTER a verb like was or seemed.", "It still describes the noun."], box: ["The sky was blue.", "Blue describes sky."] },
      { t: "compare", title: "Same word, new spot", items: [
        { mode: "adj", s: "The [warm@soup] soup cooled.", line: "Warm comes before soup. It describes soup." },
        { mode: "adj", s: "The soup tasted [warm@soup].", line: "Warm comes after tasted. It still describes soup." }
      ], text: ["In both sentences, warm tells what the soup was like."] },
      { t: "explain", title: "Verbs that link", text: ["In these sentences, the verb links the noun to a describing word.", "Was, were, felt, seemed, looked, smelled, and tasted can link.", "They do not always link. In \"Dad tasted the soup,\" tasted is an action."], box: ["The rug felt soft. (soft describes rug)", "The dogs were wet. (wet describes dogs)", "The cake smelled sweet. (sweet describes cake)", "Mom looked tired. (tired describes Mom)"] },
      { t: "show", title: "Watch me find it", mode: "adj", s: "The cat was [sleepy@cat].", text: ["Sleepy comes after was.", "Ask: what was the cat like? Sleepy describes cat."] },
      { t: "show", title: "A longer one", mode: "adj", s: "The [little@rabbit] rabbit seemed [calm@rabbit] in the [cool@grass] grass.", text: ["Little and calm both describe rabbit.", "Calm comes after seemed. Cool describes grass."] },
      { t: "guided", coach: "Find the noun first. Then look after the verb felt. Which word tells what the towel was like?", q: { mode: "adj", s: "The towel felt [dry@towel].", h: "How did the towel feel?", h2: "Look at the word after felt. Does it tell what the towel was like?", ex: "Dry describes towel. It comes after the linking verb felt." } },
      { t: "try", q: { mode: "adj", s: "The [big@pumpkins] pumpkins were [orange@pumpkins] and [round@pumpkins].", h: "Find the noun pumpkins. What were they like? Check before and after the noun.", h2: "One adjective comes before pumpkins. Two more come after were.", ex: "Big, orange, and round all describe pumpkins. Orange and round come after were." } }
    ] },
    { id: "G", title: "Comparing with Adjectives", skill: "compare", key: "Use -er or more for two things. Use -est or most for three or more.", steps: [
      { t: "explain", title: "Comparing two or more", text: ["Adjectives can compare nouns.", "Add -er to compare TWO things.", "Add -est to compare THREE or more things."], box: ["A cat is small.", "A mouse is smaller than a cat.", "Of the cat, the mouse, and the ant, the ant is the smallest."] },
      { t: "table", title: "Watch the endings", head: ["One thing", "Two things (-er)", "Three or more (-est)"], rows: [["tall", "taller", "tallest"], ["big", "bigger", "biggest"], ["happy", "happier", "happiest"]], text: ["Big doubles the g: bigger, biggest.", "Happy changes y to i: happier, happiest."] },
      { t: "explain", title: "Longer words use more and most", text: ["Many longer adjectives use more and most.", "Use more for two. Use most for three or more.", "Do not add -er too. Say more careful, not more carefuller."], box: ["careful, more careful, most careful", "colorful, more colorful, most colorful"] },
      { t: "table", title: "Special words", head: ["One", "Two", "Three or more"], rows: [["good", "better", "best"], ["bad", "worse", "worst"]], text: ["These words change all the way.", "We do not say gooder or baddest."] },
      { t: "mc", q: { q: "Jon is tall. Kim is ___ than Jon.", c: ["taller", "tallest", "more tall"], a: 0, h: "How many people are being compared?", h2: "Than Jon compares Kim with one other person. That is two people.", ex: "Taller is right. It compares two people, so tall gets -er.", why: [null, "Tallest is for three or more. This compares only Kim and Jon.", "Tall is a short word. It takes -er, not more."] } },
      { t: "guided", coach: "Count the things being compared. Two? Use -er or more. Three or more? Use -est or most.", q: { k: "mc", q: "Of the three kites, the red kite is the ___ one.", c: ["more colorful", "most colorful", "colorfulest"], a: 1, h: "How many kites are being compared? Is colorful a short word or a long word?", h2: "Colorful is a long word, so it uses more or most. Now count the kites.", ex: "Most colorful is right. Three kites are compared, and colorful is a long word, so it uses most.", why: ["More is for comparing two things. Here there are three kites.", null, "Colorful is a long word. It uses most, not -est."] } },
      { t: "try", q: { k: "fix", s: "This is the [goodest] pizza I have ever eaten.", c: ["best", "better", "most good"], a: 0, h: "Which word is not a real comparing word? Think about good, better, best.", h2: "This pizza is compared with every pizza I have ever eaten. That is more than two.", ex: "Best is right. Good changes to best when you compare three or more. Goodest is not a word.", why: [null, "Better compares only two things. This compares every pizza.", "Good is a special word. It changes to better and best."] } }
    ] }
  ],
  adverbs: [
    { id: "E", title: "Comparing with Adverbs", skill: "comparead", key: "Adverbs can compare actions: faster, fastest, more carefully, most carefully, better, best.", steps: [
      { t: "explain", title: "Comparing actions", text: ["Adverbs can compare how people do things.", "Add -er to compare two. Add -est to compare three or more."], box: ["Leo runs fast.", "Ava runs faster than Leo.", "Of all three kids, Max runs the fastest."] },
      { t: "explain", title: "-ly adverbs use more and most", text: ["Adverbs that end in -ly use more and most.", "Use more for two. Use most for three or more."], box: ["Ty writes carefully.", "Ty writes more carefully than Sam.", "Of all the kids, Ty writes the most carefully."] },
      { t: "table", title: "Adverbs to know", head: ["One", "Two", "Three or more"], rows: [["fast", "faster", "fastest"], ["hard", "harder", "hardest"], ["carefully", "more carefully", "most carefully"], ["well", "better", "best"]], text: ["Well changes all the way: well, better, best.", "We do not say weller or gooder."] },
      { t: "mc", q: { q: "Ava works hard. Ben works ___ than Ava.", c: ["harder", "hardest", "more hard"], a: 0, h: "How many people are being compared?", h2: "Than Ava means Ben is compared with one other person. That is two.", ex: "Harder is right. It compares two people, so hard gets -er.", why: [null, "Hardest is for three or more. This compares only Ben and Ava.", "Hard is a short word. It takes -er, not more."] } },
      { t: "guided", coach: "Is the sentence about two people or more than two? Then think: is the word well?", q: { k: "mc", q: "Of all the singers, Keisha sang the ___.", c: ["better", "best", "most well"], a: 1, h: "How many singers are being compared?", h2: "All the singers means more than two. Well is a special word that changes all the way.", ex: "Best is right. Well changes to best when you compare three or more.", why: ["Better compares only two. Here Keisha is compared with all the singers.", null, "Well is special. It changes to better and best. We do not say most well."] } },
      { t: "try", q: { k: "mc", q: "Our dog listens ___ than our cat.", c: ["more carefully", "most carefully", "carefullier"], a: 0, h: "How many animals are being compared? Does the adverb end in -ly?", h2: "Carefully ends in -ly, so it uses more or most. Now count the animals.", ex: "More carefully is right. It compares two animals, and carefully ends in -ly, so it uses more.", why: [null, "Most is for three or more. This compares only the dog and the cat.", "Carefully ends in -ly. It uses more, not -er."] } }
    ] }
  ],
  verbs: [
    { id: "I", title: "Subjects and Verbs Match", skill: "agree", key: "One subject often takes a verb with -s. More than one takes a verb with no -s.", steps: [
      { t: "explain", title: "Make them match", text: ["The subject is who or what the sentence is about.", "When the subject is ONE, the verb often ends in -s.", "When the subject is MORE than one, the verb has no -s."], box: ["One dog barks.", "Two dogs bark."] },
      { t: "table", title: "Verbs that change", head: ["One (he, she, it, the dog)", "More than one (they, the dogs)"], rows: [["is", "are"], ["was", "were"], ["has", "have"], ["does", "do"]], text: ["The dog is happy. The dogs are happy.", "She has a hat. They have hats."] },
      { t: "explain", title: "Two names joined by and", text: ["Mia and Leo means two people.", "So the verb matches MORE than one."], box: ["Mia plays.", "Mia and Leo play."] },
      { t: "mc", q: { q: "The cat ___ milk.", c: ["drink", "drinks", "drinking"], a: 1, h: "Is the subject one cat or more than one?", h2: "The cat is one animal. One subject often takes a verb that ends in -s.", ex: "Drinks is right. The cat is one, so the verb ends in -s.", why: ["Drink goes with more than one, like the cats.", null, "Drinking needs a helper, like is drinking."] } },
      { t: "guided", coach: "Find the subject. Is it one or more than one? Then pick the verb that matches.", q: { k: "mc", q: "Jada and her brother ___ ready for school.", c: ["is", "are", "has"], a: 1, h: "Who is the sentence about? How many people is that?", h2: "Jada and her brother are joined by and. That is two people.", ex: "Are is right. Jada and her brother are two people, so the verb is are.", why: ["Is goes with one. Jada and her brother are two people.", null, "Has does not make sense here, and it goes with one."] } },
      { t: "try", q: { k: "fix", s: "The birds in the tree [sings] every morning.", c: ["sing", "singing", "is singing"], a: 0, h: "Who sings? Is it one or more than one?", h2: "The subject is the birds, not the tree. Birds means more than one.", ex: "Sing is right. The birds are more than one, so the verb has no -s.", why: [null, "Singing needs a helper, like are singing.", "Is goes with one. The birds are more than one."] } }
    ] },
    { id: "J", title: "Past Tense Verbs", skill: "past", key: "Many past verbs end in -ed. Some change in a special way.", steps: [
      { t: "explain", title: "Past tense", text: ["Past tense verbs tell what already happened.", "Many verbs add -ed to show the past."], box: ["Today I jump. Yesterday I jumped.", "Today we play. Yesterday we played."] },
      { t: "table", title: "Spelling changes", head: ["Now", "Past", "What changed"], rows: [["stop", "stopped", "double the last letter"], ["hop", "hopped", "double the last letter"], ["carry", "carried", "change y to i, add -ed"], ["cry", "cried", "change y to i, add -ed"]], text: ["Stop and hop end with one vowel and one consonant, so the last letter doubles.", "Carry and cry change y to i before -ed."] },
      { t: "table", title: "Special past verbs", head: ["Now", "Past"], rows: [["run", "ran"], ["eat", "ate"], ["come", "came"], ["go", "went"], ["see", "saw"], ["make", "made"], ["take", "took"], ["write", "wrote"], ["catch", "caught"], ["bring", "brought"], ["think", "thought"]], text: ["These verbs do not use -ed. We learn them by heart.", "We do not say goed or catched."] },
      { t: "mc", q: { q: "Yesterday, Kim ___ her dog to the park.", c: ["walk", "walked", "walks"], a: 1, h: "Find the time clue. When did this happen?", h2: "Yesterday tells about the past. Many past verbs add -ed.", ex: "Walked is right. Yesterday is in the past, so walk adds -ed.", why: ["Walk tells about now, not yesterday.", null, "Walks tells about now, not yesterday."] } },
      { t: "guided", coach: "Look for a time clue like yesterday or last night. Then ask: does this verb use -ed, or does it change?", q: { k: "mc", q: "Last night, Darius ___ an owl in the tree.", c: ["seen", "saw", "sees"], a: 1, h: "When did this happen? Is see a verb that uses -ed?", h2: "See is a special verb. Its past form does not need a helper word.", ex: "Saw is right. See changes to saw in the past.", why: ["Seen needs a helper, like has seen.", null, "Sees tells about now, not last night."] } },
      { t: "try", q: { k: "fix", s: "Yesterday, the puppy [tryed] to catch its own tail.", c: ["tried", "tries", "trying"], a: 0, h: "Which word is spelled wrong for the past? Look for a verb that ends in y.", h2: "Try ends with a consonant and y. Think about the spelling rule for carry and cry.", ex: "Tried is right. Try changes y to i and adds -ed.", why: [null, "Tries tells about now, not yesterday.", "Trying needs a helper, like was trying."] } }
    ] },
    { id: "K", title: "Keep the Same Time", skill: "tense", key: "Keep verbs in the same time: past, now, or later.", steps: [
      { t: "explain", title: "Stay in the same time", text: ["Verbs tell when something happens: in the past, now, or later.", "In one sentence or a short story, keep the verbs in the same time."], box: ["Yesterday, I ran and jumped.", "Ran and jumped both tell about the past."] },
      { t: "table", title: "Time clues", head: ["Clue", "Time", "Example"], rows: [["yesterday", "past", "Yesterday, we walked to school."], ["every day", "now", "Every day, we walk to school."], ["tomorrow", "later", "Tomorrow, we will walk to school."]], text: ["A time clue tells you which verb form to use."] },
      { t: "explain", title: "Find the switch", text: ["Read every verb. Does one jump to a different time?", "Fix that verb so it matches the others."], box: ["Wrong: Yesterday, Leo kicked the ball and runs.", "Right: Yesterday, Leo kicked the ball and ran."] },
      { t: "mc", q: { q: "Yesterday, we ___ a movie with Grandma.", c: ["watch", "watched", "will watch"], a: 1, h: "Find the time clue. Is it past, now, or later?", h2: "Yesterday is in the past. The verb must tell about the past too.", ex: "Watched is right. Yesterday is in the past, so the verb is past.", why: ["Watch tells about now.", null, "Will watch tells about later."] } },
      { t: "guided", coach: "Find the time clue first. Then check each verb. Which one switched to a different time?", q: { k: "fix", s: "Last night, Mom read me a book. Then she [turns] off the light.", c: ["turned", "turning", "will turn"], a: 0, h: "Last night is the time clue. Which verb does not tell about the past?", h2: "Read happened last night. The next action happened last night too.", ex: "Turned is right. The story is about last night, so both verbs are past: read and turned.", why: [null, "Turning needs a helper, and it does not match the past.", "Will turn tells about later, not last night."] } },
      { t: "try", q: { k: "mc2", q: "Which mini story keeps the same time?", c: ["Every day, Zion walks his dog. He gives it a treat.", "Every day, Zion walks his dog. He gave it a treat."], a: 0, q2: "Why is that the better story?", c2: ["Both verbs tell about something that happens every day.", "Gave tells about the past, so it fits every day.", "It uses fewer words."], a2: 0, h: "Find the time clue. Then check both verbs.", h2: "Every day tells about now. Each verb should tell about now too.", ex: "The first story is right. Every day is a clue for now, so walks and gives both tell about now.", why: [null, "Gave tells about the past. It switches the time."], why2: [null, "Every day is not past. Gave switches the time.", "Short is not the reason. Both stories are almost the same length."] } }
    ] }
  ]
};

/* ───────── ADJECTIVES: practice ───────── */

var ADJ_PLUS = [
  { id: "ax1", sk: "after", s: "The [new@blanket] blanket felt [soft@blanket] on my cheek.", h: "Find the noun blanket. What kind of blanket? How did it feel?", h2: "One adjective comes before blanket. One comes after the verb felt.", ex: "New and soft both describe blanket. Soft comes after felt." },
  { id: "ax2", sk: "after", s: "After the race, Kofi was [thirsty@Kofi].", h: "What was Kofi like after the race?", h2: "Look at the word after was. Does it describe Kofi?", ex: "Thirsty describes Kofi. It comes after the linking verb was." },
  { id: "ax3", sk: "after", s: "The roses in Grandma's garden smelled [fresh@roses].", h: "How did the roses smell?", h2: "Grandma's tells whose garden. Look after smelled for the describing word.", ex: "Fresh describes roses. It comes after smelled." },
  { id: "ax4", sk: "after", s: "The [old@bridge] bridge looked [shaky@bridge] to us.", h: "Find the noun bridge. What kind of bridge? How did it look?", h2: "One adjective comes before bridge. One comes after looked.", ex: "Old and shaky both describe bridge. Shaky comes after looked." },
  { id: "ax5", sk: "after", s: "Our teacher seemed [proud@teacher] of the class.", h: "How did our teacher seem?", h2: "Our tells whose teacher. Look after seemed for the describing word.", ex: "Proud describes teacher. It comes after seemed." },
  { id: "ax6", sk: "link", s: "The [hungry@goat] goat chewed the [wet@grass] grass.", h: "Find the nouns goat and grass. What kind of goat? What kind of grass?", h2: "Look right before each noun for a describing word.", ex: "Hungry describes goat. Wet describes grass." },
  { id: "ax7", sk: "link", s: "Keisha found a [shiny@penny] penny under the bench.", h: "Find the noun penny. What kind of penny?", h2: "Look right before penny. Which word tells what kind?", ex: "Shiny describes penny." },
  { id: "ax8", sk: "link", s: "A [busy@squirrel] squirrel buried [round@acorns] acorns in the yard.", h: "Find the squirrel and the acorns. What kind of each?", h2: "Each of those two nouns has a describing word right before it.", ex: "Busy describes squirrel. Round describes acorns." },
  { id: "ax9", sk: "link", s: "Malik rode his [blue@bike] bike down the [quiet@street] street.", h: "Find the nouns bike and street. What kind of bike? What kind of street?", h2: "His tells whose bike. Look for words that tell what kind.", ex: "Blue describes bike. Quiet describes street." },
  { id: "ax10", sk: "link", s: "The [sleepy@baby] baby hugged her [fuzzy@blanket] blanket.", h: "Find the nouns baby and blanket. What kind of each?", h2: "Her tells whose blanket. Look for words that tell what kind.", ex: "Sleepy describes baby. Fuzzy describes blanket." },
  { id: "ax11", sk: "compare", k: "mc", q: "A giraffe is ___ than a zebra.", c: ["taller", "tallest", "more tall"], a: 0, h: "How many animals are being compared?", h2: "Than a zebra compares the giraffe with one other animal. That is two.", ex: "Taller is right. It compares two animals, so tall gets -er.", why: [null, "Tallest is for three or more. This compares only two animals.", "Tall is a short word. It takes -er, not more."] },
  { id: "ax12", sk: "compare", k: "mc", q: "Of the three puppies, Max is the ___ one.", c: ["smaller", "smallest", "most small"], a: 1, h: "How many puppies are being compared?", h2: "Three puppies is more than two. Small is a short word.", ex: "Smallest is right. It compares three puppies, so small gets -est.", why: ["Smaller compares only two. There are three puppies.", null, "Small is a short word. It takes -est, not most."] },
  { id: "ax13", sk: "compare", k: "mc", q: "The peacock was the ___ bird at the zoo.", c: ["colorfulest", "more colorful", "most colorful"], a: 2, h: "Is colorful a short word or a long word? How many birds are at the zoo?", h2: "Colorful is a long word, so it uses more or most. The zoo has many birds.", ex: "Most colorful is right. The peacock is compared with many birds, and colorful is a long word.", why: ["Colorful is a long word. It uses most, not -est.", "More compares only two. The zoo has many birds.", null] },
  { id: "ax14", sk: "compare", k: "mc", q: "Tia is ___ with paint than her little brother.", c: ["carefuller", "more careful", "most careful"], a: 1, h: "How many people are being compared? Is careful a long word?", h2: "Careful is a long word, so it uses more or most. Count the people.", ex: "More careful is right. It compares two people, and careful uses more.", why: ["Careful is a long word. It uses more, not -er.", null, "Most is for three or more. This compares Tia and her brother."] },
  { id: "ax15", sk: "compare", k: "mc", q: "Today's lunch was ___ than yesterday's lunch.", c: ["gooder", "better", "best"], a: 1, h: "How many lunches are being compared? Think: good, better, best.", h2: "Two lunches are compared. Good is a special word that changes all the way.", ex: "Better is right. Good changes to better when you compare two things.", why: ["Gooder is not a word. Good changes to better.", null, "Best is for three or more. Only two lunches are compared."] },
  { id: "ax16", sk: "compare", k: "fix", s: "This is the [baddest] storm we have had all year.", c: ["worst", "worse", "most bad"], a: 0, h: "Which word is not a real comparing word? Think: bad, worse, worst.", h2: "This storm is compared with every storm all year. That is more than two.", ex: "Worst is right. Bad changes to worst when you compare three or more. Baddest is not a word.", why: [null, "Worse compares only two. This compares every storm all year.", "Bad is a special word. It changes to worse and worst."] },
  { id: "ax17", sk: "compare", k: "fix", s: "My backpack is [biger] than my sister's backpack.", c: ["bigger", "biggest", "more big"], a: 0, h: "Which word is spelled wrong? Think about the rule for big.", h2: "Two backpacks are compared. Big ends with one vowel and one consonant.", ex: "Bigger is right. Big doubles the g before -er. It compares two backpacks.", why: [null, "Biggest is for three or more. Only two backpacks are compared.", "Big is a short word. It takes -er, not more."] },
  { id: "ax18", sk: "compare", k: "mc", q: "The baby is ___ now than she was this morning.", c: ["happyer", "happier", "happiest"], a: 1, h: "How many times are being compared? How does happy change before -er?", h2: "Now and this morning are two times. Happy ends in y.", ex: "Happier is right. It compares two times, and happy changes y to i before -er.", why: ["Happy changes y to i before -er.", null, "Happiest is for three or more. This compares two times."] },
  { id: "ax19", sk: "compare", k: "mc2", q: "Which sentence is correct?", c: ["My cold is worst today than it was yesterday.", "My cold is worse today than it was yesterday."], a: 1, q2: "Why is that the better sentence?", c2: ["Worst is used to compare two days.", "It compares two days, so it uses worse.", "Worse is a shorter word."], a2: 1, h: "How many days are being compared?", h2: "Count the things being compared. Today and yesterday are two days. Which form of bad compares two?", ex: "The second sentence is right. It compares two days, so bad changes to worse.", why: ["Worst is for three or more. This compares two days.", null], why2: ["Worst compares three or more, not two.", null, "Length is not the reason. Count how many days are compared."] }
];

/* ───────── ADJECTIVES: check ───────── */

var ADJ_PLUS_CHECK = [
  { id: "axc1", sk: "after", s: "The lemonade tasted [sour@lemonade] without sugar.", h: "How did the lemonade taste?", h2: "Look at the word after tasted. Does it describe the lemonade?", ex: "Sour describes lemonade. It comes after tasted." },
  { id: "axc2", sk: "after", s: "The kittens were [tiny@kittens] and [fluffy@kittens].", h: "What were the kittens like? There are two describing words.", h2: "Both describing words come after were.", ex: "Tiny and fluffy both describe kittens. They come after were." },
  { id: "axc3", sk: "after", s: "Jada felt [nervous@Jada] before the show.", h: "How did Jada feel?", h2: "Look at the word after felt. Does it describe Jada?", ex: "Nervous describes Jada. It comes after felt." },
  { id: "axc4", sk: "link", s: "Omar splashed in a [deep@puddle] puddle with his [yellow@boots] boots.", h: "Find the nouns puddle and boots. What kind of each?", h2: "His tells whose boots. Look for words that tell what kind.", ex: "Deep describes puddle. Yellow describes boots." },
  { id: "axc5", sk: "link", s: "The [tall@giraffe] giraffe ate [green@leaves] leaves from the tree.", h: "Find the giraffe and the leaves. What kind of each?", h2: "Look right before each of those nouns.", ex: "Tall describes giraffe. Green describes leaves." },
  { id: "axc6", sk: "compare", k: "mc", q: "Our new car is ___ than our old car.", c: ["quieter", "quietest", "more quieter"], a: 0, h: "How many cars are being compared?", h2: "Than our old car means two cars are compared.", ex: "Quieter is right. It compares two cars, so quiet gets -er.", why: [null, "Quietest is for three or more. Only two cars are compared.", "Use -er OR more, never both."] },
  { id: "axc7", sk: "compare", k: "mc", q: "Of all the books on the shelf, this one is the ___.", c: ["more interesting", "most interesting", "interestingest"], a: 1, h: "How many books are being compared? Is interesting a long word?", h2: "Interesting is a long word, so it uses more or most. All the books is more than two.", ex: "Most interesting is right. It compares many books, and interesting is a long word.", why: ["More compares only two. Here there are many books.", null, "Interesting is a long word. It uses most, not -est."] },
  { id: "axc8", sk: "compare", k: "fix", s: "The red apple is [gooder] than the green apple.", c: ["better", "best", "more good"], a: 0, h: "Which word is not a real comparing word? Think: good, better, best.", h2: "Two apples are compared. Good changes all the way.", ex: "Better is right. Good changes to better when you compare two things.", why: [null, "Best is for three or more. Only two apples are compared.", "Good is a special word. It changes to better."] },
  { id: "axc9", sk: "compare", k: "mc", q: "Our classroom is the ___ room in the whole school.", c: ["sunnier", "sunniest", "sunnyest"], a: 1, h: "How many rooms are being compared? How does sunny change?", h2: "The whole school has many rooms. Sunny ends in y.", ex: "Sunniest is right. It compares many rooms, and sunny changes y to i before -est.", why: ["Sunnier compares only two. The school has many rooms.", null, "Sunny changes y to i before -est."] },
  { id: "axc10", sk: "compare", k: "fix", s: "Today is the [hotest] day of the summer.", c: ["hottest", "hotter", "most hot"], a: 0, h: "Which word is spelled wrong? Think about the rule for big.", h2: "Today is compared with every summer day. Hot ends with one vowel and one consonant.", ex: "Hottest is right. Hot doubles the t before -est, and it compares many days.", why: [null, "Hotter compares only two. This compares every summer day.", "Hot is a short word. It takes -est, not most."] }
];

/* ───────── ADVERBS: practice ───────── */

var ADV_PLUS = [
  { id: "dx1", sk: "comparead", k: "mc", q: "Zion ran ___ than his cousin in the race.", c: ["fast", "faster", "fastest"], a: 1, h: "How many people are being compared?", h2: "Than his cousin means two people. Fast is a short word.", ex: "Faster is right. It compares two people, so fast gets -er.", why: ["Fast does not compare. The word than needs a comparing word.", null, "Fastest is for three or more. This compares only two people."] },
  { id: "dx2", sk: "comparead", k: "mc", q: "Of all the kids on the team, Lena kicks the ball the ___.", c: ["harder", "hardest", "more hard"], a: 1, h: "How many kids are being compared?", h2: "All the kids on the team is more than two. Hard is a short word.", ex: "Hardest is right. It compares the whole team, so hard gets -est.", why: ["Harder compares only two. Lena is compared with the whole team.", null, "Hard is a short word. It takes -est, not more."] },
  { id: "dx3", sk: "comparead", k: "mc", q: "Ben colors ___ than he did last year.", c: ["more carefully", "most carefully", "more careful"], a: 0, h: "Two times are compared: now and last year. Which word tells HOW Ben colors?", h2: "The word must tell how Ben colors, so it needs -ly. Count the times compared.", ex: "More carefully is right. It compares two times, and carefully tells how Ben colors.", why: [null, "Most is for three or more. This compares now and last year.", "Careful describes a noun. To tell how Ben colors, use carefully."] },
  { id: "dx4", sk: "comparead", k: "mc", q: "Amara sings ___ than she did last spring.", c: ["gooder", "better", "best"], a: 1, h: "Two times are compared: now and last spring. Think: well, better, best.", h2: "Well is a special word that changes all the way. This compares two times.", ex: "Better is right. Well changes to better when you compare two.", why: ["Gooder is not a word. Well changes to better.", null, "Best is for three or more. This compares two times."] },
  { id: "dx5", sk: "comparead", k: "mc", q: "Of the three dogs, Rex listens the ___.", c: ["better", "best", "most well"], a: 1, h: "How many dogs are being compared? Think: well, better, best.", h2: "Three dogs is more than two. Well changes all the way.", ex: "Best is right. Well changes to best when you compare three or more.", why: ["Better compares only two. There are three dogs.", null, "Well is special. We do not say most well."] },
  { id: "dx6", sk: "comparead", k: "fix", s: "Jayden jumped [highest] than his friend Leo.", c: ["higher", "high", "more high"], a: 0, h: "How many people are being compared? Look at the word than.", h2: "Than his friend Leo compares two people. High is a short word.", ex: "Higher is right. It compares two people, so high gets -er.", why: [null, "High does not compare. The word than needs a comparing word.", "High is a short word. It takes -er, not more."] },
  { id: "dx7", sk: "comparead", k: "fix", s: "Of all the runners, Nia ran the [faster].", c: ["fastest", "fast", "most fast"], a: 0, h: "How many runners are being compared?", h2: "All the runners is more than two. Fast is a short word.", ex: "Fastest is right. Nia is compared with all the runners, so fast gets -est.", why: [null, "Fast does not compare. Nia is compared with all the runners.", "Fast is a short word. It takes -est, not most."] },
  { id: "dx8", sk: "comparead", k: "mc2", q: "Which sentence is correct?", c: ["Kim reads most carefully than Jon.", "Kim reads more carefully than Jon."], a: 1, q2: "Why is that the better sentence?", c2: ["It compares two people, so it uses more.", "It compares many people, so it uses most.", "More is a shorter word."], a2: 0, h: "How many people are being compared?", h2: "Kim and Jon are two people. Carefully ends in -ly.", ex: "The second sentence is right. It compares two people, so it uses more carefully.", why: ["Most is for three or more. This compares only Kim and Jon.", null], why2: [null, "Only Kim and Jon are compared. That is two, not many.", "Length is not the reason. Count how many people are compared."] }
];

/* ───────── ADVERBS: check ───────── */

var ADV_PLUS_CHECK = [
  { id: "dxc1", sk: "comparead", k: "mc", q: "The wind blew ___ today than it did yesterday.", c: ["hard", "harder", "hardest"], a: 1, h: "How many days are being compared?", h2: "Today and yesterday are two days. Look at the word than.", ex: "Harder is right. It compares two days, so hard gets -er.", why: ["Hard does not compare. The word than needs a comparing word.", null, "Hardest is for three or more. This compares two days."] },
  { id: "dxc2", sk: "comparead", k: "mc", q: "Of all the players, Kiara plays the ___.", c: ["better", "best", "goodest"], a: 1, h: "How many players are being compared? Think: well, better, best.", h2: "All the players is more than two. Well changes all the way.", ex: "Best is right. Kiara is compared with all the players, so well changes to best.", why: ["Better compares only two. Kiara is compared with all the players.", null, "Goodest is not a word."] },
  { id: "dxc3", sk: "comparead", k: "mc", q: "Our team played ___ in the second game than in the first game.", c: ["better", "best", "more well"], a: 0, h: "How many games are being compared? Think: well, better, best.", h2: "Two games are compared. Well is a special word.", ex: "Better is right. Well changes to better when you compare two.", why: [null, "Best is for three or more. Only two games are compared.", "Well is special. We do not say more well."] },
  { id: "dxc4", sk: "comparead", k: "fix", s: "Of all the kids, Dee cuts the paper the [more] carefully.", c: ["most", "much", "many"], a: 0, h: "How many kids are being compared?", h2: "All the kids is more than two. Carefully ends in -ly.", ex: "Most is right. Dee is compared with all the kids, so it is the most carefully.", why: [null, "Much does not compare here. Use more or most with -ly words.", "Many does not compare actions. Use more or most with -ly words."] },
  { id: "dxc5", sk: "comparead", k: "mc", q: "A cheetah runs ___ than a horse.", c: ["faster", "fastest", "more fast"], a: 0, h: "How many animals are being compared?", h2: "Than a horse compares the cheetah with one other animal.", ex: "Faster is right. It compares two animals, so fast gets -er.", why: [null, "Fastest is for three or more. This compares two animals.", "Fast is a short word. It takes -er, not more."] }
];

/* ───────── VERBS: practice ───────── */

var VERB_APP = [
  { id: "va1", sk: "agree", k: "mc", q: "The puppy ___ at the mail carrier every morning.", c: ["bark", "barks", "barking"], a: 1, h: "Is the subject one puppy or more than one?", h2: "The puppy is one animal. One subject often takes a verb that ends in -s.", ex: "Barks is right. The puppy is one, so the verb ends in -s.", why: ["Bark goes with more than one, like the puppies.", null, "Barking needs a helper, like is barking."] },
  { id: "va2", sk: "agree", k: "mc", q: "Two ducks ___ in the pond.", c: ["swims", "swim", "swimming"], a: 1, h: "How many ducks are there?", h2: "Two ducks is more than one. More than one takes a verb with no -s.", ex: "Swim is right. Two ducks are more than one, so the verb has no -s.", why: ["Swims goes with one duck.", null, "Swimming needs a helper, like are swimming."] },
  { id: "va3", sk: "agree", k: "mc", q: "Mia and Leo ___ soccer after school.", c: ["plays", "play", "is playing"], a: 1, h: "Who plays? How many people is that?", h2: "Mia and Leo are joined by and. That is two people.", ex: "Play is right. Mia and Leo are two people, so the verb has no -s.", why: ["Plays goes with one person.", null, "Is goes with one. Two people need are, like are playing."] },
  { id: "va4", sk: "agree", k: "mc", q: "The cookies ___ ready to eat.", c: ["is", "are", "was"], a: 1, h: "Is the subject one cookie or more than one?", h2: "Cookies ends in -s, so it means more than one.", ex: "Are is right. The cookies are more than one, so the verb is are.", why: ["Is goes with one. The cookies are more than one.", null, "Was goes with one. More than one takes were."] },
  { id: "va5", sk: "agree", k: "mc", q: "My sister ___ a new red bike.", c: ["have", "has", "having"], a: 1, h: "Is the subject one person or more than one?", h2: "Ask: is the subject one person or more than one? Then use the lesson table: which form of have goes with that subject?", ex: "Has is right. My sister is one person, so the verb is has.", why: ["Have goes with more than one, like my sisters.", null, "Having needs a helper, like is having."] },
  { id: "va6", sk: "agree", k: "fix", s: "The boys [was] tired after the long game.", c: ["were", "is", "has"], a: 0, h: "Is the subject one boy or more than one?", h2: "Boys means more than one. Was and were are partners.", ex: "Were is right. The boys are more than one, so the verb is were.", why: [null, "Is goes with one, and it tells about now.", "Has goes with one person or thing, and it does not fit before tired here."] },
  { id: "va7", sk: "agree", k: "fix", s: "Grandpa [do] the dishes every night.", c: ["does", "doing", "done"], a: 0, h: "Is the subject one person or more than one?", h2: "Grandpa is one person. Think: one takes does, more than one takes do.", ex: "Does is right. Grandpa is one person, so the verb is does.", why: [null, "Doing needs a helper, like is doing.", "Done needs a helper, like has done."] },
  { id: "va8", sk: "agree", k: "mc2", q: "Which sentence is correct?", c: ["Jada and her mom walks to the store.", "Jada and her mom walk to the store."], a: 1, q2: "Why is that the better sentence?", c2: ["Jada is one person, so the verb ends in -s.", "The subject is two people joined by and, so the verb has no -s.", "Walk is a shorter word."], a2: 1, h: "Who walks to the store? How many people is that?", h2: "Look at the word and. It joins two people into one subject.", ex: "The second sentence is right. Jada and her mom are two people, so the verb is walk.", why: ["Walks goes with one. Jada and her mom are two people.", null], why2: ["The subject is not just Jada. It is Jada and her mom.", null, "Length is not the reason. Count the people in the subject."] },
  { id: "va9", sk: "past", k: "mc", q: "Yesterday, Imani ___ a letter to her grandma.", c: ["writed", "wrote", "writes"], a: 1, h: "When did this happen? Does write use -ed?", h2: "Write is a special verb. It changes in the past.", ex: "Wrote is right. Write changes to wrote in the past.", why: ["Write does not use -ed. Its past is wrote.", null, "Writes tells about now, not yesterday."] },
  { id: "va10", sk: "past", k: "mc", q: "Last night, we ___ tacos for dinner.", c: ["eated", "ate", "eat"], a: 1, h: "When did this happen? Does eat use -ed?", h2: "Eat is a special verb. It changes in the past.", ex: "Ate is right. Eat changes to ate in the past.", why: ["Eat does not use -ed. Its past is ate.", null, "Eat tells about now, not last night."] },
  { id: "va11", sk: "past", k: "mc", q: "Yesterday, the bus ___ at the red light.", c: ["stoped", "stopped", "stop"], a: 1, h: "When did this happen? How does stop change before -ed?", h2: "Stop ends with one vowel and one consonant.", ex: "Stopped is right. Stop doubles the p before -ed.", why: ["Stop doubles the p before -ed.", null, "Stop tells about now, not yesterday."] },
  { id: "va12", sk: "past", k: "mc", q: "Last week, Dad ___ the heavy box up the stairs.", c: ["carryed", "carried", "carries"], a: 1, h: "When did this happen? How does carry change before -ed?", h2: "Carry ends in y. Think about what happens to y before -ed.", ex: "Carried is right. Carry changes y to i, then adds -ed.", why: ["Carry changes y to i before -ed.", null, "Carries tells about now, not last week."] },
  { id: "va13", sk: "past", k: "fix", s: "Last summer, my family [goed] to the beach.", c: ["went", "gone", "going"], a: 0, h: "Which word is not a real past verb? Does go use -ed?", h2: "Go is a special verb. It changes all the way in the past.", ex: "Went is right. Go changes to went in the past. Goed is not a word.", why: [null, "Gone needs a helper, like has gone.", "Going needs a helper, like was going."] },
  { id: "va14", sk: "past", k: "fix", s: "Ravi [catched] a big fish at the lake yesterday.", c: ["caught", "catch", "catches"], a: 0, h: "Which word is not a real past verb? Does catch use -ed?", h2: "Catch is a special verb. It changes in the past.", ex: "Caught is right. Catch changes to caught in the past.", why: [null, "Catch tells about now, not yesterday.", "Catches tells about now, not yesterday."] },
  { id: "va15", sk: "past", k: "mc", q: "This morning, Nana ___ muffins to our class.", c: ["brung", "brought", "bringed"], a: 1, h: "Does bring use -ed in the past?", h2: "Bring is a special verb. Think of think and thought.", ex: "Brought is right. Bring changes to brought in the past.", why: ["Brung is not a correct past form.", null, "Bring does not use -ed. Its past is brought."] },
  { id: "va16", sk: "past", k: "fix", s: "Yesterday, I [thinked] about my lost tooth all day.", c: ["thought", "thinks", "thinking"], a: 0, h: "Which word is not a real past verb? Does think use -ed?", h2: "Think is a special verb. Think of bring and brought.", ex: "Thought is right. Think changes to thought in the past.", why: [null, "Thinks goes with one person, and it tells about now.", "Thinking needs a helper, like was thinking."] },
  { id: "va17", sk: "past", k: "mc", q: "Last Saturday, Malik ___ his dog for a long walk.", c: ["taked", "took", "takes"], a: 1, h: "When did this happen? Does take use -ed?", h2: "Take is a special verb. It changes in the past.", ex: "Took is right. Take changes to took in the past.", why: ["Take does not use -ed. Its past is took.", null, "Takes tells about now, not last Saturday."] },
  { id: "va18", sk: "tense", k: "fix", s: "Yesterday, we [walk] to the park and played on the swings.", c: ["walked", "walking", "walks"], a: 0, h: "Find the time clue. Which verb does not match it?", h2: "Yesterday is in the past. Played already tells about the past.", ex: "Walked is right. Yesterday is in the past, so walked matches played.", why: [null, "Walking needs a helper, and it does not match played.", "Walks tells about now. It does not match yesterday."] },
  { id: "va19", sk: "tense", k: "fix", s: "Every day, Tasha feeds her fish and [cleaned] the bowl.", c: ["cleans", "clean", "cleaning"], a: 0, h: "Find the time clue. Which verb switched times?", h2: "Every day tells about now. Feeds already tells about now.", ex: "Cleans is right. Every day is a clue for now, so cleans matches feeds.", why: [null, "Clean goes with more than one. Tasha is one person.", "Cleaning needs a helper, like is cleaning."] },
  { id: "va20", sk: "tense", k: "fix", s: "Tomorrow, Grandpa will bake bread and [shared] it with us.", c: ["share", "shares", "sharing"], a: 0, h: "Find the time clue. Which verb switched times?", h2: "Tomorrow is later. Will works with both actions: will bake and will ...", ex: "Share is right. Tomorrow is later, so it is will bake and will share.", why: [null, "Shares tells about now. After will, use share.", "Sharing does not go with will."] },
  { id: "va21", sk: "tense", k: "mc", q: "Last night, the wind blew hard. The tree branches ___ on the window.", c: ["tap", "tapped", "will tap"], a: 1, h: "Find the time clue. Is the story in the past, now, or later?", h2: "Last night is in the past. Blew already tells about the past.", ex: "Tapped is right. The story is about last night, so both verbs are past.", why: ["Tap tells about now. The story is about last night.", null, "Will tap tells about later. The story is about last night."] },
  { id: "va22", sk: "tense", k: "mc", q: "Every morning, Jamal brushes his teeth. Then he ___ his hair.", c: ["combed", "combs", "will comb"], a: 1, h: "Find the time clue. Does it tell about the past, now, or later?", h2: "Every morning tells about now. Brushes already tells about now.", ex: "Combs is right. Every morning is a clue for now, so combs matches brushes.", why: ["Combed tells about the past. It does not match every morning.", null, "Will comb tells about later. It does not match every morning."] },
  { id: "va23", sk: "tense", k: "mc2", q: "Which sentence keeps the same time?", c: ["Yesterday, Ana jumped in the leaves and laughs.", "Yesterday, Ana jumped in the leaves and laughed."], a: 1, q2: "Why is that the better sentence?", c2: ["Laughs tells about now, so it fits yesterday.", "Both verbs tell about the past, so they match yesterday.", "It has more letters."], a2: 1, h: "Find the time clue. Then check both verbs.", h2: "Yesterday is in the past. Each verb should tell about the past.", ex: "The second sentence is right. Jumped and laughed both tell about the past, like yesterday.", why: ["Laughs tells about now. It switches the time.", null], why2: ["Yesterday is in the past. Laughs tells about now.", null, "Letters are not the reason. Check the time of each verb."] },
  { id: "va24", sk: "tense", k: "fix", s: "Tomorrow, our class [visited] the fire station.", c: ["will visit", "visiting", "visit"], a: 0, h: "Find the time clue. Does the verb match it?", h2: "Tomorrow is later. Visited tells about the past.", ex: "Will visit is right. Tomorrow is later, so the verb tells about later.", why: [null, "Visiting needs a helper, like will be visiting.", "Visit by itself does not tell about later, and our class is one group."] }
];

/* ───────── VERBS: check ───────── */

var VERB_APP_CHECK = [
  { id: "vac1", sk: "agree", k: "mc", q: "The bus ___ at the corner.", c: ["stop", "stops", "stopping"], a: 1, h: "Is the subject one bus or more than one?", h2: "The bus is one thing. One subject often takes a verb that ends in -s.", ex: "Stops is right. The bus is one, so the verb ends in -s.", why: ["Stop goes with more than one, like the buses.", null, "Stopping needs a helper, like is stopping."] },
  { id: "vac2", sk: "agree", k: "mc", q: "Kofi and Ama ___ their homework at the table.", c: ["does", "do", "doing"], a: 1, h: "Who does the homework? How many people is that?", h2: "Kofi and Ama are joined by and. That is two people.", ex: "Do is right. Kofi and Ama are two people, so the verb is do.", why: ["Does goes with one person.", null, "Doing needs a helper, like are doing."] },
  { id: "vac3", sk: "agree", k: "fix", s: "The flowers in the pot [is] pink.", c: ["are", "was", "am"], a: 0, h: "What is pink: the flowers or the pot?", h2: "The subject is the flowers. Flowers means more than one.", ex: "Are is right. The flowers are more than one, so the verb is are.", why: [null, "Was goes with just one thing. The flowers are more than one.", "Am goes only with I."] },
  { id: "vac4", sk: "agree", k: "mc", q: "Yesterday, the kittens ___ hungry.", c: ["was", "were", "is"], a: 1, h: "Is the subject one kitten or more than one?", h2: "Kittens means more than one. Yesterday tells about the past.", ex: "Were is right. The kittens are more than one, and yesterday is past, so the verb is were.", why: ["Was goes with one. The kittens are more than one.", null, "Is goes with one, and it tells about now."] },
  { id: "vac5", sk: "agree", k: "mc", q: "My cat ___ two white paws.", c: ["have", "has", "having"], a: 1, h: "Is the subject one cat or more than one?", h2: "Ask: is the subject one animal or more than one? Then use the lesson table: which form of have goes with that subject?", ex: "Has is right. My cat is one, so the verb is has.", why: ["Have goes with more than one, like my cats.", null, "Having needs a helper, like is having."] },
  { id: "vac6", sk: "past", k: "mc", q: "Yesterday, Zuri ___ a paper boat.", c: ["maked", "made", "makes"], a: 1, h: "When did this happen? Does make use -ed?", h2: "Make is a special verb. It changes in the past.", ex: "Made is right. Make changes to made in the past.", why: ["Make does not use -ed. Its past is made.", null, "Makes tells about now, not yesterday."] },
  { id: "vac7", sk: "past", k: "fix", s: "Last night, our dog [runned] after a rabbit.", c: ["ran", "run", "running"], a: 0, h: "Which word is not a real past verb? Does run use -ed?", h2: "Run is a special verb. It changes in the past.", ex: "Ran is right. Run changes to ran in the past.", why: [null, "Run tells about now, not last night.", "Running needs a helper, like was running."] },
  { id: "vac8", sk: "past", k: "mc", q: "Yesterday, the baby ___ until she fell asleep.", c: ["cryed", "cried", "cries"], a: 1, h: "When did this happen? How does cry change before -ed?", h2: "Cry ends in y. Think about what happens to y before -ed.", ex: "Cried is right. Cry changes y to i, then adds -ed.", why: ["Cry changes y to i before -ed.", null, "Cries tells about now, not yesterday."] },
  { id: "vac9", sk: "past", k: "fix", s: "Last Monday, our teacher [taked] us to the library.", c: ["took", "taken", "takes"], a: 0, h: "Which word is not a real past verb? Does take use -ed?", h2: "Take is a special verb. It changes in the past.", ex: "Took is right. Take changes to took in the past.", why: [null, "Taken needs a helper, like has taken.", "Takes tells about now, not last Monday."] },
  { id: "vac10", sk: "past", k: "mc", q: "Aunt Rose ___ to visit us last weekend.", c: ["comed", "came", "comes"], a: 1, h: "Find the time clue. Does come use -ed?", h2: "Last weekend is in the past. Come is a special verb.", ex: "Came is right. Come changes to came in the past.", why: ["Come does not use -ed. Its past is came.", null, "Comes tells about now, not last weekend."] },
  { id: "vac11", sk: "tense", k: "fix", s: "Last week, Kayla [paints] a picture and gave it to her mom.", c: ["painted", "paint", "painting"], a: 0, h: "Find the time clue. Which verb switched times?", h2: "Last week is in the past. Gave already tells about the past.", ex: "Painted is right. Last week is in the past, so painted matches gave.", why: [null, "Paint tells about now. It does not match last week.", "Painting needs a helper, like was painting."] },
  { id: "vac12", sk: "tense", k: "mc", q: "Every day, the farmer milks the cows. Then she ___ the hens.", c: ["fed", "feeds", "will feed"], a: 1, h: "Find the time clue. Does it tell about the past, now, or later?", h2: "Every day tells about now. Milks already tells about now.", ex: "Feeds is right. Every day is a clue for now, so feeds matches milks.", why: ["Fed tells about the past. It does not match every day.", null, "Will feed tells about later. It does not match every day."] },
  { id: "vac13", sk: "tense", k: "fix", s: "Yesterday, the puppy dug a hole and [hides] its bone.", c: ["hid", "hide", "hiding"], a: 0, h: "Find the time clue. Which verb switched times?", h2: "Yesterday is in the past. Dug already tells about the past. Hide is a special verb.", ex: "Hid is right. Yesterday is in the past, so hid matches dug.", why: [null, "Hide tells about now. It does not match yesterday.", "Hiding needs a helper, like was hiding."] },
  { id: "vac14", sk: "tense", k: "mc", q: "Tomorrow, we will pack a lunch. Then we ___ to the lake.", c: ["drove", "driving", "will drive"], a: 2, h: "Find the time clue. Is the story in the past, now, or later?", h2: "Tomorrow is later. Will pack already tells about later.", ex: "Will drive is right. Tomorrow is later, so will drive matches will pack.", why: ["Drove tells about the past. The story is about tomorrow.", "Driving needs a helper, like will be driving.", null] }
];

var LESSONS_ADD_WORKSHOP = {
  workshop: [
    { id: 'A', title: 'Precise Words', skill: 'precise', key: 'Precise words tell exactly what kind or exactly how, so the reader can see the picture.', steps: [
      { t: 'explain', title: 'Precise words paint a picture', text: ['Some words are fuzzy, like nice, good, or went.', 'Precise words tell exactly what kind or exactly how.', 'They help the reader see the picture.'], box: ['The dog went down the street.', 'The muddy dog raced down the street.', 'Muddy tells what kind of dog. Raced tells exactly how it moved.'] },
      { t: 'explain', title: 'A simple swap', text: ['Good does not tell us much.', 'Sweet tells exactly how the cake tasted.'], box: ['The cake was good.', 'The cake was sweet.'] },
      { t: 'explain', title: 'Pick a word for a purpose', text: ['First think: what do I want the reader to know?', 'Then pick the word that shows exactly that.'], box: ['Goal: show that the class was calm.', 'The kids worked.', 'The kids worked quietly at their tidy desks.', 'Quietly tells how they worked. Tidy tells what kind of desks.'] },
      { t: 'guided', coach: 'Ask: What do I want the reader to know? Which word shows exactly that?', q: { k: 'mc', q: 'Ayo wants readers to know the blanket kept her warm.\nWhich sentence shows that best?', c: ['Ayo wrapped up in a nice blanket.', 'Ayo wrapped up in a cozy blanket.', 'Ayo wrapped up in a big blanket.'], a: 1, h: 'The goal is warm. Which describing word makes you feel warm?', h2: 'Ask: what do you want the reader to know? Pick the sentence whose describing word shows that the blanket keeps her warm.', ex: 'Cozy is the best choice. Cozy tells that the blanket felt soft and warm.', why: ['Nice is fuzzy. It does not tell how the blanket felt.', null, 'Big tells the size, not that the blanket was warm.'] } },
      { t: 'try', q: { k: 'mc2', q: 'Deshawn talked to the baby.\nWhich revision tells exactly HOW Deshawn talked?', c: ['Deshawn talked softly to the baby.', 'Deshawn talked a lot to the baby.', 'Deshawn really talked to the baby.'], a: 0, q2: 'Why is that the best revision?', c2: ['Softly tells exactly how he talked.', 'It makes the sentence much longer.', 'It adds a new person to the sentence.'], a2: 0, h: 'Find the choice with a word that tells HOW. Picture his voice.', h2: 'A precise adverb lets you hear the voice in your head. Ask of each choice: does it tell exactly HOW he talked?', ex: 'Deshawn talked softly to the baby. Softly is an adverb that tells exactly how he talked.', why: [null, 'A lot tells how much, but not what his voice sounded like.', 'Really is a fuzzy word. It does not tell how he talked.'], why2: [null, 'Longer is not always better. The word must tell exactly how.', 'No new person was added. Softly tells how he talked.'] } }
    ] },
    { id: 'B', title: 'Compound Sentences', skill: 'compound', key: 'A compound sentence joins two complete sentences with a comma and and, but, or so.', steps: [
      { t: 'explain', title: 'Three kinds of sentences', text: ['A simple sentence has one complete idea.', 'A compound sentence joins two complete ideas.', 'A complex sentence has a part that cannot stand alone.'], box: ['Simple: Jada kicked the ball.', 'Compound: Jada kicked the ball, and Leo caught it.', 'Complex: Leo cheered because Jada scored.'] },
      { t: 'explain', title: 'Pick the joining word', text: ['Each part of a compound sentence could be its own sentence.', 'Put a comma before the joining word.'], box: ['and = adds more', 'but = shows a difference', 'so = shows a result'] },
      { t: 'explain', title: 'A simple example', text: ['The second idea adds more, so we use and.'], box: ['I like apples. My sister likes pears.', 'I like apples, and my sister likes pears.'] },
      { t: 'explain', title: 'A richer example', text: ['The wet field and the game going on are different. Use but.', 'The dark room happened because of the storm. Use so.'], box: ['The field was wet, but the game went on.', 'The storm knocked out the lights, so we used flashlights.'] },
      { t: 'guided', coach: 'Ask: does the second idea add, contrast, or show a result?', q: { k: 'mc', q: 'Pick the joining word.\nTanya forgot her jacket, ___ she felt cold at recess.', c: ['but', 'so', 'because'], a: 1, h: 'What happened because Tanya forgot her jacket?', h2: 'Feeling cold came from forgetting the jacket. The second idea is a result.', ex: 'So is right. Feeling cold was the result of forgetting her jacket.', why: ['But shows a difference. Forgetting a jacket and feeling cold go together.', null, 'Because would mean she forgot her jacket since she felt cold. That is backward.'] } },
      { t: 'try', q: { k: 'order', q: 'Put the parts in order to make a compound sentence.', parts: ['The sun came out,', 'so', 'we went', 'to the pool.'], h: 'Start with the part that has a capital letter. End with the part that has a period.', h2: 'The comma comes right before the joining word so.', ex: 'The sun came out, so we went to the pool. The comma and so join two complete ideas.' } },
      { t: 'try', q: { k: 'mc', q: 'Which compound sentence uses the comma correctly?', c: ['Kai drew a map and, Rosa painted it.', 'Kai drew a map, and Rosa painted it.', 'Kai drew, a map and Rosa painted it.'], a: 1, h: 'Find the joining word. Where does the comma go?', h2: 'The comma goes at the end of the first complete idea, just before the joining word.', ex: 'Kai drew a map, and Rosa painted it. The comma comes right before and.', why: ['The comma goes before and, not after it.', null, 'This comma splits the first idea in the middle.'] } }
    ] },
    { id: 'C', title: 'Complex Sentences', skill: 'complex', key: 'A part that starts with because, when, after, before, or if cannot stand alone. Join it to a complete sentence.', steps: [
      { t: 'explain', title: 'Parts that cannot stand alone', text: ['Some parts start with because, when, after, before, or if.', 'These parts cannot stand alone.', 'Join them to a complete sentence.'], box: ['Because it was raining. (not complete)', 'We stayed inside because it was raining. (complete)'] },
      { t: 'explain', title: 'What each word tells', text: ['Pick the word that fits the meaning.'], box: ['because tells why', 'when tells at what time', 'before and after tell the order', 'if tells what has to happen first'] },
      { t: 'explain', title: 'A simple example', text: ['Before tells the order. Brushing came first.'], box: ['I brushed my teeth before I went to bed.'] },
      { t: 'explain', title: 'A richer example: the comma', text: ['The joining word can start the sentence.', 'Then put a comma after that first part.'], box: ['Before I went to bed, I brushed my teeth.', 'If it snows tomorrow, we will build a fort.'] },
      { t: 'guided', coach: 'Ask: does this part tell why, when, the order, or what has to happen first?', q: { k: 'mc', q: 'Pick the joining word that tells why.\nOur plants grew tall ___ we watered them every day.', c: ['because', 'before', 'if'], a: 0, h: 'Why did the plants grow tall?', h2: 'Watering every day is the reason the plants grew. Find the word that tells why.', ex: 'Because is right. It tells why the plants grew tall.', why: [null, 'Before would mean the plants grew tall first. But they grew from the water.', 'If tells what has to happen first. This sentence tells what already happened and why.'] } },
      { t: 'try', q: { k: 'order', q: 'Put the parts in order to make a complex sentence.', parts: ['After the bell rang,', 'the students', 'lined up', 'for lunch.'], h: 'Find the part with the capital letter and the comma. It starts the sentence.', h2: 'After the comma comes who did it, then what they did.', ex: 'After the bell rang, the students lined up for lunch. A comma comes after the after part.' } },
      { t: 'try', q: { k: 'mc', q: 'Which sentence uses the comma correctly?', c: ['If the bus is late we will walk.', 'If the bus is late, we will walk.', 'If, the bus is late we will walk.'], a: 1, h: 'The sentence starts with if. Where does the if part end?', h2: 'Find where the if part ends and the complete idea begins. The comma goes between those two parts.', ex: 'If the bus is late, we will walk. The comma comes after the if part.', why: ['The if part starts the sentence, so it needs a comma after it.', null, 'The comma does not go right after if. It goes after the whole if part.'] } }
    ] },
    { id: 'D', title: 'Combine and Revise', skill: 'revise', key: 'Join short sentences with a word that keeps the meaning, and fix fragments and run-ons.', steps: [
      { t: 'explain', title: 'Make sentences work together', text: ['Too many short sentences can sound choppy.', 'Join them with a word that keeps the meaning.'], box: ['Choppy: The puppy was tired. It took a nap.', 'Smooth: The puppy was tired, so it took a nap.'] },
      { t: 'explain', title: 'A simple example', text: ['When both sentences are about the same person, you can share the naming part.'], box: ['Kira likes soccer. Kira likes art.', 'Kira likes soccer and art.'] },
      { t: 'explain', title: 'A richer example: fix broken sentences', text: ['A fragment is not a complete idea.', 'A run-on jams two sentences together with no joining word.'], box: ['Fragment: Because the gate was open.', 'Fixed: The goat got out because the gate was open.', 'Run-on: I lost my pencil I borrowed one.', 'Fixed: I lost my pencil, so I borrowed one.'] },
      { t: 'guided', coach: 'Ask: Does it keep the meaning? Is it complete, with a comma before the joining word?', q: { k: 'mc', q: 'Choose the best way to combine.\nThe team lost the game. They still had fun.', c: ['The team lost the game, so they still had fun.', 'The team lost the game, but they still had fun.', 'The team lost the game they still had fun.'], a: 1, h: 'Are losing and having fun alike, or different?', h2: 'Losing usually feels bad, and having fun feels good. These ideas are a contrast.', ex: 'The team lost the game, but they still had fun. But shows the difference between losing and having fun.', why: ['So means losing caused the fun. That does not make sense.', null, 'This is a run-on. It needs a comma and a joining word.'] } },
      { t: 'try', q: { k: 'mc2', q: 'Which revision fixes this run-on?\nThe oven beeped Mom took out the pizza.', c: ['The oven beeped Mom, took out the pizza.', 'The oven beeped, but Mom took out the pizza.', 'The oven beeped, so Mom took out the pizza.'], a: 2, q2: 'Why does that revision work?', c2: ['It uses a comma and so to join two complete ideas, and so shows a result.', 'It makes the sentence shorter.', 'It turns both ideas into fragments.'], a2: 0, h: 'Why did Mom take out the pizza?', h2: 'Mom took out the pizza because the oven beeped. The second idea is a result.', ex: 'The oven beeped, so Mom took out the pizza. The comma and so join the two ideas and show a result.', why: ['The comma is in the wrong place. It is still a run-on.', 'But shows a difference. Mom took the pizza out because of the beep.', null], why2: [null, 'It is not shorter. It adds a comma and so.', 'Both parts are still complete ideas. Now they are joined correctly.'] } }
    ] }
  ]
};

var WS_BANK = [
  /* precise */
  { id: 'ws1', sk: 'precise', k: 'mc', q: 'Jamal wants readers to know the lemonade was very cold.\nJamal sipped the ___ lemonade.', c: ['icy', 'nice', 'yellow'], a: 0, h: 'The goal is cold. Which word makes you feel cold?', h2: 'Ask: what does Jamal want the reader to feel? Pick the word that tells about temperature.', ex: 'Icy is best. Icy tells exactly how cold the lemonade was.', why: [null, 'Nice is fuzzy. It does not tell that the lemonade was cold.', 'Yellow tells the color, not how cold it was.'] },
  { id: 'ws2', sk: 'precise', k: 'mc', q: 'Sofia does not want to wake her little brother.\nSofia tiptoed ___ past his room.', c: ['loudly', 'silently', 'well'], a: 1, h: 'How should Sofia move so she does not wake him?', h2: 'To keep someone asleep, you make no sound. Look for the word that tells exactly how.', ex: 'Silently is best. It tells that Sofia made no sound.', why: ['Loudly would wake her brother.', null, 'Well is fuzzy. It does not tell how quiet she was.'] },
  { id: 'ws3', sk: 'precise', k: 'mc', q: 'Which sentence gives the clearest picture?', c: ['The bird sang.', 'The bird sang nicely.', 'The tiny red bird sang sweetly.'], a: 2, h: 'Which sentence tells what kind of bird AND how it sang?', h2: 'Precise words tell size, color, and sound. Count how many clear details each choice gives.', ex: 'The tiny red bird sang sweetly. Tiny and red tell what kind of bird. Sweetly tells how it sang.', why: ['This sentence has no describing words.', 'Nicely is fuzzy. We still cannot picture the bird.', null] },
  { id: 'ws4', sk: 'precise', k: 'sort', q: 'Sort the describing words.', b: ['Fuzzy (not exact)', 'Precise (exact picture)'], items: [['nice', 0], ['crunchy', 1], ['good', 0], ['gently', 1], ['okay', 0], ['soggy', 1]], h: 'Can you picture, feel, or hear the word?', h2: 'Fuzzy words could describe almost anything. Precise words give one clear picture, like a sound or a feeling.', ex: 'Nice, good, and okay are fuzzy. Crunchy, gently, and soggy tell exactly what kind or how.' },
  { id: 'ws5', sk: 'precise', k: 'mc2', q: 'The cookies were good.\nWhich revision tells exactly what kind of cookies they were?', c: ['The cookies were very good.', 'The cookies were warm and chewy.', 'The cookies were really, really good.'], a: 1, q2: 'Why is that the best revision?', c2: ['It uses the most words.', 'Very makes any sentence precise.', 'Warm and chewy tell exactly what kind of cookies.'], a2: 2, h: 'Which choice helps you feel and taste the cookies?', h2: 'Adding very or really to a fuzzy word keeps it fuzzy. Look for brand new describing words.', ex: 'The cookies were warm and chewy. Warm and chewy tell exactly what kind of cookies they were.', why: ['Very good is still fuzzy. We do not know how they tasted.', null, 'Saying really twice does not tell what kind of cookies.'], why2: ['More words is not the goal. Exact words are.', 'Very does not tell what kind. It only makes good stronger.', null] },
  { id: 'ws6', sk: 'precise', k: 'mc', q: 'Aaliyah wants readers to know the puppy was scared.\nWhich sentence shows that best?', c: ['The puppy hid under the bed.', 'The happy puppy hid under the bed.', 'The trembling puppy hid under the bed.'], a: 2, h: 'What does a scared puppy look like?', h2: 'When animals are afraid, their bodies shake. Find the word that shows that.', ex: 'The trembling puppy hid under the bed. Trembling shows the puppy was shaking with fear.', why: ['This sentence has no word that shows the puppy felt scared.', 'Happy is the opposite of scared.', null] },
  { id: 'ws7', sk: 'precise', k: 'mc', q: 'Show that Hana ran with great speed.\nHana ran ___ to first base.', c: ['nicely', 'swiftly', 'slowly'], a: 1, h: 'The goal is great speed. Which word tells how fast?', h2: 'Look for the adverb that tells exactly how Hana ran: very fast.', ex: 'Swiftly is best. Swiftly means very fast.', why: ['Nicely is fuzzy. It does not tell speed.', null, 'Slowly is the opposite of great speed.'] },
  { id: 'ws8', sk: 'precise', k: 'mc', q: 'Mateo changed "The soup was hot" to "The soup was steaming."\nWhy is steaming better?', c: ['It is a longer word.', 'It helps the reader see the steam and know how hot the soup was.', 'It tells where the soup was.'], a: 1, h: 'What can you picture when you read steaming?', h2: 'A precise word helps the reader see something. Think about what rises from very hot soup.', ex: 'Steaming lets the reader picture steam rising, so they know exactly how hot the soup was.', why: ['A long word is not always a precise word.', null, 'Steaming tells what kind of soup, not where it was.'] },
  /* compound */
  { id: 'ws9', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nRavi likes to swim, ___ his brother does too.', c: ['and', 'but', 'so'], a: 0, h: 'Does the second idea add, contrast, or show a result?', h2: 'The word too tells us the brothers are the same. The second idea adds more.', ex: 'And is right. The second idea adds more: his brother likes to swim too.', why: [null, 'But shows a difference. Too shows they are the same.', 'So shows a result. Ravi liking to swim does not cause his brother to like it.'] },
  { id: 'ws10', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nThe puzzle was hard, ___ Keisha finished it.', c: ['so', 'but', 'because'], a: 1, h: 'Would you expect a hard puzzle to get finished?', h2: 'A hard puzzle is tough to finish, yet Keisha did it. That is a surprise, a contrast.', ex: 'But is right. It shows a contrast: the puzzle was hard, yet Keisha finished it.', why: ['So would mean the puzzle being hard made her finish it.', null, 'Because would mean the puzzle was hard since she finished it. That is backward.'] },
  { id: 'ws11', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nOur garden needed water, ___ we filled the watering can.', c: ['so', 'but', 'because'], a: 0, h: 'Why did we fill the watering can?', h2: 'Filling the can happened because the garden needed water. The second idea is a result.', ex: 'So is right. Filling the watering can was the result of the garden needing water.', why: [null, 'But shows a difference. These two ideas go together.', 'Because would mean the garden needed water since we filled the can. That is backward.'] },
  { id: 'ws12', sk: 'compound', k: 'order', q: 'Put the parts in order to make a compound sentence.', parts: ['The library was closed,', 'so', 'we read books', 'at home.'], h: 'Find the part with a capital letter. Find the part with a period.', h2: 'The comma ends the first complete idea. The joining word comes right after it.', ex: 'The library was closed, so we read books at home. So shows the result.' },
  { id: 'ws13', sk: 'compound', k: 'mc', q: 'Which compound sentence is written correctly?', c: ['Dylan has a kite but, the wind is calm.', 'Dylan has a kite, but the wind is calm.', 'Dylan has, a kite but the wind is calm.'], a: 1, h: 'Find the joining word. Where does the comma belong?', h2: 'The comma goes at the end of the first complete idea, right before the joining word.', ex: 'Dylan has a kite, but the wind is calm. The comma comes right before but.', why: ['The comma goes before but, not after it.', null, 'This comma splits the first idea in the middle.'] },
  { id: 'ws14', sk: 'compound', k: 'fix', s: 'Chen practiced every day, [but] he played the song perfectly at the recital.', c: ['so', 'if', 'or'], a: 0, h: 'Read both ideas. Does the second idea add, contrast, or show a result?', h2: 'Playing perfectly happened because of all that practice. The joining word should show a result.', ex: 'So is right. Playing the song perfectly was the result of practicing every day.', why: [null, 'If tells what has to happen first. Both things already happened.', 'Or gives a choice. Chen did both things.'] },
  { id: 'ws15', sk: 'compound', k: 'mc', q: 'Which sentence is a compound sentence?', c: ['Tasha and her dad baked bread.', 'Tasha baked bread, and her dad made soup.', 'Tasha baked bread after school.'], a: 1, h: 'Look for two complete ideas joined by a comma and a joining word.', h2: 'Cover the part after the joining word. Is the part after it a complete sentence by itself?', ex: 'Tasha baked bread, and her dad made soup. Both parts are complete sentences joined by a comma and and.', why: ['This has two people but only one idea. It is a simple sentence.', null, 'This is one complete idea. It is a simple sentence.'] },
  { id: 'ws16', sk: 'compound', k: 'order', q: 'Put the parts in order to make a compound sentence.', parts: ['Jordan wanted to play outside,', 'but', 'it was', 'too windy.'], h: 'Start with the capital letter. End with the period.', h2: 'The comma ends the first idea. Then comes the joining word, then the second idea.', ex: 'Jordan wanted to play outside, but it was too windy. But shows a contrast.' },
  { id: 'ws17', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nThe bakery sells muffins, ___ it sells bagels too.', c: ['but', 'so', 'and'], a: 2, h: 'Does the second idea add, contrast, or show a result?', h2: 'The word too means one more thing. The second idea adds to the first.', ex: 'And is right. The bakery sells muffins, and it also sells bagels.', why: ['But shows a difference. Too shows the bakery sells one more thing.', 'So shows a result. Selling muffins does not cause selling bagels.', null] },
  /* complex */
  { id: 'ws18', sk: 'complex', k: 'mc', q: 'Which word tells WHY?\nZuri wore her rain boots ___ the ground was muddy.', c: ['because', 'before', 'if'], a: 0, h: 'Why did Zuri wear rain boots?', h2: 'The muddy ground is the reason. Only one word tells a reason.', ex: 'Because tells why. Zuri wore rain boots because the ground was muddy.', why: [null, 'Before tells the order, not why.', 'If tells what has to happen first, not why.'] },
  { id: 'ws19', sk: 'complex', k: 'mc', q: 'Pick the joining word that fits.\nWash your hands ___ you eat lunch.', c: ['but', 'before', 'so'], a: 1, h: 'Which comes first: washing or eating?', h2: 'Clean hands come first, then eating. Pick the word that tells the order.', ex: 'Before is right. You wash your hands first, before you eat lunch.', why: ['But shows a difference. Washing and eating go together.', null, 'So shows a result. Washing your hands does not make you eat.'] },
  { id: 'ws20', sk: 'complex', k: 'mc', q: 'Which sentence uses the comma correctly?', c: ['When the bell rings we, line up.', 'When, the bell rings we line up.', 'When the bell rings, we line up.'], a: 2, h: 'The sentence starts with when. Where does the when part end?', h2: 'Find where the when part ends and the complete idea begins. The comma goes between those two parts.', ex: 'When the bell rings, we line up. The comma comes after the when part.', why: ['This comma splits the second part.', 'The comma does not go right after when. It goes after the whole when part.', null] },
  { id: 'ws21', sk: 'complex', k: 'order', q: 'Put the parts in order to make a complex sentence.', parts: ['Before the race started,', 'Darius', 'stretched', 'his legs.'], h: 'Find the part with the capital letter and the comma.', h2: 'After the before part comes who, then what he did.', ex: 'Before the race started, Darius stretched his legs. A comma comes after the before part.' },
  { id: 'ws22', sk: 'complex', k: 'mc', q: 'Which part CANNOT stand alone as a sentence?', c: ['the gym was closed', 'because the gym was closed', 'we played outside'], a: 1, h: 'Read each part. Does it sound finished, or does it leave you waiting?', h2: 'A part that starts with because leaves you waiting for the rest of the idea.', ex: 'Because the gym was closed cannot stand alone. It needs a complete idea, like "We played outside because the gym was closed."', why: ['The gym was closed is a complete idea. It can stand alone.', null, 'We played outside is a complete idea. It can stand alone.'] },
  { id: 'ws23', sk: 'complex', k: 'fix', s: 'We will go sledding tomorrow [because] it snows tonight.', c: ['if', 'but', 'so'], a: 0, h: 'Has it snowed yet? Do we know it will?', h2: 'Sledding can happen only in the case that it snows. Pick the word that tells what has to happen first.', ex: 'If is right. We will go sledding only if it snows tonight.', why: [null, 'But shows a difference. Snow and sledding go together.', 'So would mean sledding makes it snow. That is backward.'] },
  { id: 'ws24', sk: 'complex', k: 'mc', q: 'The sun went down first. Then the owl woke up.\nThe owl woke up ___ the sun went down.', c: ['before', 'after', 'so'], a: 1, h: 'Which happened first? Which word tells that order?', h2: 'The owl woke up later than the sunset. Pick the word that means later than.', ex: 'After is right. The owl woke up after the sun went down.', why: ['Before would mean the owl woke up first.', null, 'So shows a result. The sentence needs to tell the order.'] },
  { id: 'ws25', sk: 'complex', k: 'order', q: 'Put the parts in order to make a complex sentence.', parts: ['If you feed the fish,', 'it will swim', 'to the top.'], h: 'Find the if part. It has a capital letter and a comma.', h2: 'After the comma comes the part that tells what will happen.', ex: 'If you feed the fish, it will swim to the top. A comma comes after the if part.' },
  { id: 'ws26', sk: 'complex', k: 'mc', q: 'Which sentence is a complex sentence?', c: ['The bus stopped, and we got on.', 'We got on the bus.', 'We got on the bus when it stopped.'], a: 2, h: 'Look for a part that starts with because, when, after, before, or if.', h2: 'A complex sentence has one part that cannot stand alone. Find a part that starts with a word like when.', ex: 'We got on the bus when it stopped. "When it stopped" cannot stand alone, so this is a complex sentence.', why: ['This joins two complete ideas with a comma and and. It is a compound sentence.', 'This has one complete idea. It is a simple sentence.', null] },
  /* revise */
  { id: 'ws27', sk: 'revise', k: 'mc', q: 'Choose the best way to combine.\nThe soup was too hot. Ben waited for it to cool.', c: ['The soup was too hot, so Ben waited for it to cool.', 'The soup was too hot, but Ben waited for it to cool.', 'The soup was too hot Ben waited for it to cool.'], a: 0, h: 'Why did Ben wait?', h2: 'Ben waited because the soup was too hot. The second idea is a result.', ex: 'The soup was too hot, so Ben waited for it to cool. So shows the result.', why: [null, 'But shows a difference. Waiting goes with hot soup.', 'This is a run-on. It needs a comma and a joining word.'] },
  { id: 'ws28', sk: 'revise', k: 'mc', q: 'Choose the best way to combine.\nEbony plays the piano. Ebony sings in the choir.', c: ['Ebony plays the piano, so sings in the choir.', 'Ebony plays the piano and sings in the choir.', 'Ebony plays the piano sings in the choir.'], a: 1, h: 'Both sentences are about Ebony. Can she share one naming part?', h2: 'When the naming part is the same, you can join the two actions with and.', ex: 'Ebony plays the piano and sings in the choir. And joins her two actions.', why: ['So shows a result, and the second part has no one doing it.', null, 'The two actions need and between them.'] },
  { id: 'ws29', sk: 'revise', k: 'mc', q: 'Which choice is a complete sentence?', c: ['When the bus came.', 'Got on the bus.', 'When the bus came, we got on.'], a: 2, h: 'A complete sentence tells who and what happened, and it sounds finished.', h2: 'A when part leaves you waiting. A part with no naming word does not tell who.', ex: 'When the bus came, we got on. It has a complete idea, so it sounds finished.', why: ['This is a fragment. What happened when the bus came?', 'This is a fragment. It does not tell who got on.', null] },
  { id: 'ws30', sk: 'revise', k: 'mc', q: 'Which choice fixes this run-on?\nThe dog barked the cat ran up a tree.', c: ['The dog barked the cat, ran up a tree.', 'The dog barked, so the cat ran up a tree.', 'The dog barked and the cat ran, up a tree.'], a: 1, h: 'Find where the first idea ends. What should go there?', h2: 'Find where the first complete idea ends. A run-on needs a comma and a joining word at that spot, and the joining word must fit the meaning.', ex: 'The dog barked, so the cat ran up a tree. The comma and so join two complete ideas.', why: ['The comma is in the wrong place. The cat did the running.', null, 'This comma splits ran and up a tree. The comma belongs before and.'] },
  { id: 'ws31', sk: 'revise', k: 'mc2', q: 'Which revision joins these sentences best?\nThe park was crowded. We found a spot for our picnic.', c: ['The park was crowded, so we found a spot for our picnic.', 'The park was crowded we found a spot for our picnic.', 'The park was crowded, but we found a spot for our picnic.'], a: 2, q2: 'Why does that revision work?', c2: ['But shows a surprise: the park was crowded, yet they still found a spot.', 'But shows that the crowd helped them find a spot.', 'It joins the ideas without a comma.'], a2: 0, h: 'Does a crowded park make it easy or hard to find a spot?', h2: 'A crowded park makes it hard to find a spot. Finding one anyway is a contrast.', ex: 'The park was crowded, but we found a spot for our picnic. But shows the surprise.', why: ['So would mean the crowd helped them find a spot.', 'This is a run-on. It needs a comma and a joining word.', null], why2: [null, 'The crowd made it harder, not easier. That is why but fits.', 'The revision does use a comma, right before but.'] },
  { id: 'ws32', sk: 'revise', k: 'mc2', q: 'Which revision fixes this fragment?\nBecause our class won the reading contest.', c: ['Because our class won. The reading contest.', 'Because our class won the reading contest, we had a pizza party.', 'Our class because won the reading contest.'], a: 1, q2: 'Why does that revision work?', c2: ['It takes out the word because.', 'It adds a period in the middle.', 'It adds a complete idea, so the because part does not stand alone.'], a2: 2, h: 'A because part tells why. Why what? What is missing?', h2: 'The fragment tells the reason but not what happened. Find the choice that adds what happened.', ex: 'Because our class won the reading contest, we had a pizza party. The new part tells what happened.', why: ['Now there are two fragments.', null, 'Because is in the wrong place, and the idea is still not clear.'], why2: ['The revision keeps because. It adds a complete idea.', 'There is no new period in the middle. A comma comes after the because part.', null] },
  { id: 'ws33', sk: 'revise', k: 'mc', q: 'Choose the best way to combine.\nThe timer rang. Dad took the bread out of the oven.', c: ['When the timer rang Dad, took the bread out of the oven.', 'The timer rang, but Dad took the bread out of the oven.', 'When the timer rang, Dad took the bread out of the oven.'], a: 2, h: 'When did Dad take out the bread? Check the comma too.', h2: 'Find where the when part ends and the complete idea begins. The comma goes between those two parts.', ex: 'When the timer rang, Dad took the bread out of the oven. When tells the time, and the comma follows the when part.', why: ['The comma belongs after rang, not after Dad.', 'But shows a difference. Dad took the bread out because the timer rang.', null] },
  { id: 'ws34', sk: 'revise', k: 'mc', q: 'Which one is a run-on sentence?', c: ['I finished my book, and I started a new one.', 'I finished my book I started a new one.', 'After I finished my book, I started a new one.'], a: 1, h: 'Look for two complete ideas jammed together.', h2: 'A run-on has two complete ideas with no comma and no joining word between them.', ex: 'I finished my book I started a new one is a run-on. It needs a comma and a joining word, like ", and".', why: ['This joins the ideas with a comma and and. It is correct.', null, 'This uses after and a comma. It is correct.'] }
];

var WS_CHECK = [
  /* precise */
  { id: 'wsc1', sk: 'precise', k: 'mc', q: 'Priya wants readers to know the pond was very still.\nThe ___ pond looked like a mirror.', c: ['wavy', 'fine', 'calm'], a: 2, h: 'What does water look like when it is very still?', h2: 'Still water has no waves. Find the word that tells exactly that.', ex: 'Calm is best. Calm tells that the water was still, like a mirror.', why: ['Wavy is the opposite of still.', 'Fine is fuzzy. It does not tell how the water looked.', null] },
  { id: 'wsc2', sk: 'precise', k: 'mc', q: 'Kendrick does not want any water to spill.\nKendrick carried the full fishbowl ___.', c: ['carefully', 'quickly', 'happily'], a: 0, h: 'How should you carry something full of water?', h2: 'To keep water from spilling, you move slowly and pay close attention. Pick the word that tells that.', ex: 'Carefully is best. It tells exactly how to carry a full fishbowl so no water spills.', why: [null, 'Moving quickly could make the water spill.', 'Happily tells how he felt, not how he kept the water in.'] },
  { id: 'wsc3', sk: 'precise', k: 'mc', q: 'Which sentence gives the clearest picture?', c: ['Grandma made a quilt.', 'Grandma stitched a soft, striped quilt.', 'Grandma made a nice quilt.'], a: 1, h: 'Which sentence helps you see AND feel the quilt?', h2: 'Look for words that tell how the quilt feels and what it looks like.', ex: 'Grandma stitched a soft, striped quilt. Soft and striped tell exactly what kind of quilt.', why: ['This sentence has no describing words.', null, 'Nice is fuzzy. We cannot picture the quilt.'] },
  { id: 'wsc4', sk: 'precise', k: 'mc2', q: 'The snow was pretty.\nWhich revision tells exactly how the snow looked?', c: ['The snow was so pretty.', 'The snow was there.', 'The snow was sparkling and white.'], a: 2, q2: 'Why is that the best revision?', c2: ['Sparkling and white help the reader see the snow.', 'It adds the word so.', 'It is the shortest choice.'], a2: 0, h: 'Which choice lets you picture the snow?', h2: 'So pretty is still fuzzy. Look for words that show light and color.', ex: 'The snow was sparkling and white. Those words show exactly how the snow looked.', why: ['So pretty is still fuzzy.', 'There tells where, not how the snow looked.', null], why2: [null, 'The best revision does not use so.', 'Short is not the goal. Clear is.'] },
  { id: 'wsc5', sk: 'precise', k: 'mc', q: 'Layla wants readers to know the baby could not stop giggling.\nThe baby giggled ___.', c: ['once', 'nonstop', 'quietly'], a: 1, h: 'How long did the giggling last?', h2: 'Could not stop means it kept going. Find the word that means that.', ex: 'Nonstop is best. It tells that the baby kept giggling without stopping.', why: ['Once means one time. The baby kept going.', null, 'Quietly tells how loud, not that she could not stop.'] },
  /* compound */
  { id: 'wsc6', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nThe museum has dinosaur bones, ___ it has a space room too.', c: ['and', 'so', 'but'], a: 0, h: 'Does the second idea add, contrast, or show a result?', h2: 'Too means one more thing. The second idea adds to the first.', ex: 'And is right. The museum has dinosaur bones, and it also has a space room.', why: [null, 'So shows a result. Bones do not cause a space room.', 'But shows a difference. Too shows one more thing.'] },
  { id: 'wsc7', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nThe sky was cloudy, ___ the sun peeked out by noon.', c: ['so', 'because', 'but'], a: 2, h: 'Would you expect the sun on a cloudy day?', h2: 'Clouds hide the sun, yet the sun came out. That is a contrast.', ex: 'But is right. It shows a contrast: the sky was cloudy, yet the sun peeked out.', why: ['So would mean the clouds made the sun come out.', 'Because would mean the sky was cloudy since the sun came out. That is backward.', null] },
  { id: 'wsc8', sk: 'compound', k: 'mc', q: 'Pick the joining word.\nMy shoelace came untied, ___ I stopped to tie it.', c: ['but', 'so', 'because'], a: 1, h: 'Why did I stop?', h2: 'Stopping happened because the shoelace came untied. The second idea is a result.', ex: 'So is right. Stopping to tie it was the result of the untied shoelace.', why: ['But shows a difference. These ideas go together.', null, 'Because would mean the lace came untied since I stopped. That is backward.'] },
  { id: 'wsc9', sk: 'compound', k: 'order', q: 'Put the parts in order to make a compound sentence.', parts: ['Kofi set the table,', 'and', 'his sister', 'poured the milk.'], h: 'Start with the capital letter. End with the period.', h2: 'The comma ends the first idea. The joining word comes right after it.', ex: 'Kofi set the table, and his sister poured the milk. And adds a second idea.' },
  { id: 'wsc10', sk: 'compound', k: 'fix', s: 'Nadia was very sleepy, [so] she stayed awake until the end of the movie.', c: ['but', 'or', 'if'], a: 0, h: 'Does a sleepy person usually stay awake?', h2: 'Being sleepy and staying awake do not match. The joining word should show a contrast.', ex: 'But is right. Nadia was sleepy, yet she stayed awake. That is a contrast.', why: [null, 'Or gives a choice. Both things happened: she was sleepy, and she stayed awake.', 'If tells what has to happen first. This already happened.'] },
  /* complex */
  { id: 'wsc11', sk: 'complex', k: 'mc', q: 'Which word tells WHY?\nThe crowd clapped ___ the singer hit the high note.', c: ['before', 'because', 'if'], a: 1, h: 'Why did the crowd clap?', h2: 'The high note is the reason for clapping. Only one word tells a reason.', ex: 'Because tells why. The crowd clapped because the singer hit the high note.', why: ['Before tells the order, not why.', null, 'If tells what has to happen first, not why.'] },
  { id: 'wsc12', sk: 'complex', k: 'mc', q: 'Pick the joining word that fits.\nYou can borrow my markers ___ you give them back.', c: ['after', 'so', 'if'], a: 2, h: 'What has to happen for you to borrow the markers?', h2: 'Giving them back is the rule you must follow. Pick the word for what has to happen.', ex: 'If is right. You can borrow the markers only if you give them back.', why: ['After would mean you borrow them once you have given them back. That is backward.', 'So shows a result. Borrowing the markers does not make you give them back.', null] },
  { id: 'wsc13', sk: 'complex', k: 'mc', q: 'Which sentence uses the comma correctly?', c: ['After we planted the seeds we, watered them.', 'After we planted the seeds, we watered them.', 'After we planted, the seeds we watered them.'], a: 1, h: 'Where does the after part end?', h2: 'The after part is "After we planted the seeds." The comma goes right after it.', ex: 'After we planted the seeds, we watered them. The comma comes after the after part.', why: ['This comma splits the second part.', null, 'This comma cuts the after part too soon. Seeds belongs with planted.'] },
  { id: 'wsc14', sk: 'complex', k: 'order', q: 'Put the parts in order to make a complex sentence.', parts: ['When the lights', 'went out,', 'Grandpa', 'lit a candle.'], h: 'Find the part with the capital letter. Which part finishes it before the comma?', h2: 'The when part ends with a comma. Then comes who, then what he did.', ex: 'When the lights went out, Grandpa lit a candle. A comma comes after the when part.' },
  { id: 'wsc15', sk: 'complex', k: 'fix', s: 'Mia put on her pajamas [after] she fell asleep.', c: ['before', 'if', 'so'], a: 0, h: 'Can you put on pajamas while you are asleep?', h2: 'Pajamas go on first, then sleep. Pick the word that tells that order.', ex: 'Before is right. Mia put on her pajamas before she fell asleep.', why: [null, 'If tells what has to happen first. This sentence tells the order.', 'So shows a result. Pajamas do not make you fall asleep.'] },
  /* revise */
  { id: 'wsc16', sk: 'revise', k: 'mc', q: 'Choose the best way to combine.\nThe river was deep. The kids stayed on the shore.', c: ['The river was deep, but the kids stayed on the shore.', 'The river was deep the kids stayed on the shore.', 'The river was deep, so the kids stayed on the shore.'], a: 2, h: 'Why did the kids stay on the shore?', h2: 'Staying on the shore happened because the river was deep. The second idea is a result.', ex: 'The river was deep, so the kids stayed on the shore. So shows the result.', why: ['But shows a difference. Staying safe goes with a deep river.', 'This is a run-on. It needs a comma and a joining word.', null] },
  { id: 'wsc17', sk: 'revise', k: 'mc', q: 'Which choice is a complete sentence?', c: ['After the parade ended.', 'Waved flags at the parade.', 'After the parade ended, we walked home.'], a: 2, h: 'Does it tell who and what happened? Does it sound finished?', h2: 'An after part leaves you waiting. A part with no naming word does not tell who.', ex: 'After the parade ended, we walked home. It has a complete idea, so it sounds finished.', why: ['This is a fragment. What happened after the parade?', 'This is a fragment. It does not tell who waved.', null] },
  { id: 'wsc18', sk: 'revise', k: 'mc', q: 'Which choice fixes this run-on?\nMy tooth was loose I wiggled it all day.', c: ['My tooth was loose I, wiggled it all day.', 'My tooth was loose, so I wiggled it all day.', 'My tooth, was loose I wiggled it all day.'], a: 1, h: 'Find where the first idea ends.', h2: 'The first idea is "My tooth was loose." Put a comma and a joining word right after it.', ex: 'My tooth was loose, so I wiggled it all day. The comma and so join two complete ideas.', why: ['The comma is in the wrong place. It is still a run-on.', null, 'This comma splits the first idea. It is still a run-on.'] },
  { id: 'wsc19', sk: 'revise', k: 'mc2', q: 'Which revision joins these sentences best?\nThe ice cream was melting. It dripped down Kayla’s hand.', c: ['The ice cream was melting, but it dripped down Kayla’s hand.', 'The ice cream was melting, so it dripped down Kayla’s hand.', 'The ice cream was melting it dripped down Kayla’s hand.'], a: 1, q2: 'Why does that revision work?', c2: ['So shows that the two ideas are opposites.', 'So can join ideas without a comma.', 'So shows a result: the melting made it drip.'], a2: 2, h: 'Why did the ice cream drip?', h2: 'Melting ice cream drips. The dripping is a result of the melting.', ex: 'The ice cream was melting, so it dripped down Kayla’s hand. So shows the result.', why: ['But shows a difference. Melting and dripping go together.', null, 'This is a run-on. It needs a comma and a joining word.'], why2: ['But shows opposites. So shows a result.', 'A compound sentence needs a comma before so.', null] },
  { id: 'wsc20', sk: 'revise', k: 'mc2', q: 'Which revision fixes this fragment?\nIf the rain stops soon.', c: ['If the rain stops. Soon.', 'If the rain stops soon, we can play kickball.', 'The rain if stops soon.'], a: 1, q2: 'Why does that revision work?', c2: ['It adds a complete idea, and a comma follows the if part.', 'It takes away the word if.', 'It makes the sentence shorter.'], a2: 0, h: 'The if part tells what has to happen. What will happen then?', h2: 'The fragment is missing the part that tells what happens. Look for the choice that adds it.', ex: 'If the rain stops soon, we can play kickball. The new part finishes the idea, and a comma follows the if part.', why: ['Now there are two fragments.', null, 'If is in the wrong place, and the idea is still not finished.'], why2: [null, 'The revision keeps if.', 'It is longer, because it adds a complete idea.'] }
];

var LESSONS_ADD_WORD = {
  vowels: [
    { id: 'I', title: 'Word Study: Syllables', skill: 'syll', key: 'Every syllable has one vowel sound; split between two consonants, then blend the parts.', steps: [
      { t: 'explain', title: 'Words have parts', text: ['Long words are made of small parts called syllables.', 'Every syllable has one vowel sound.', 'Count vowel sounds, not vowel letters.'], box: ['sunset has two vowel sounds: u and e', 'So sunset has 2 syllables.'] },
      { t: 'explain', title: 'Split between two consonants', text: ['Find the vowels first.', 'If two consonants stand between the vowels, split between them.'], box: ['napkin: the vowels are a and i', 'The two consonants between them are p and k', 'Split between p and k: nap|kin'] },
      { t: 'explain', title: 'Simple example: blend the parts', text: ['When the two middle consonants are the same letter, split between them too.', 'Then put the parts back together to read the word.'], box: ['rab + bit → rabbit', 'pic + nic → picnic'] },
      { t: 'explain', title: 'Richer example: compound words', text: ['A compound word is two small words put together.', 'Split it between the two small words.'], box: ['sun + set → sunset', 'sun|set: each small word is one syllable', 'Blend: sun, set, sunset!'] },
      { t: 'guided', coach: 'Find the vowels first. Then split between the two consonants in the middle.', q: { k: 'mc', q: 'How do you split the word traffic into syllables?', c: ['traf|fic', 'tra|ffic', 'traff|ic'], a: 0, h: 'Where are the vowels? What letters sit between them?', h2: 'The vowels are a and i. Two f letters sit between them, so split between the two f letters.', ex: 'traf|fic. Each syllable gets one f and one vowel sound.', why: [null, 'This puts both f letters in the second part. Split between the two f letters.', 'This puts both f letters in the first part. Split between them.'] } },
      { t: 'try', q: { k: 'mc', q: 'Cobweb is a compound word. How do you split it?', c: ['cob|web', 'co|bweb', 'cobw|eb'], a: 0, h: 'What two small words do you see in cobweb?', h2: 'A compound word splits between its two small words. Find where the first small word ends.', ex: 'cob|web. Cob and web are the two small words, and each has one vowel sound.', why: [null, 'Co is not a whole small word. Look for the two small words.', 'Cobw and eb are not small words. Split between cob and web.'] } }
    ] },
    { id: 'J', title: 'Word Study: Vowel Patterns in Syllables', skill: 'across', key: 'Look at each syllable: closed means short, open means long, and silent e or a vowel team also means long.', steps: [
      { t: 'explain', title: 'Closed and open syllables', text: ['A closed syllable ends with a consonant. Its vowel is usually short.', 'An open syllable ends with a vowel. Its vowel usually says its name.'], box: ['nap|kin: nap ends with p → closed → short a', 'ti|ger: ti ends with i → open → long i', 'ro|bot: ro ends with o → open → long o'] },
      { t: 'table', title: 'Four kinds of syllables', head: ['Kind', 'What to look for', 'Example'], rows: [['Closed', 'ends with a consonant; short vowel', 'rab|bit'], ['Open', 'ends with one vowel; long vowel', 'ro|bot, mu|sic'], ['Silent e', 'vowel, consonant, then e; long vowel', 'cup|cake, in|side'], ['Vowel team', 'two vowels together: ai, ee, ea, oa', 'rain|bow, sea|son, toast|er']], text: 'These are the same patterns you learned in short words. Now you look for them inside each syllable.' },
      { t: 'explain', title: 'Simple example: one word, two kinds', text: ['Look at one syllable at a time.'], box: ['cup|cake', 'cup ends with p → closed → short u', 'cake ends with silent e → long a'] },
      { t: 'explain', title: 'Richer example: check each part', text: ['Some words mix kinds of syllables.', 'Find the pattern in each part.'], box: ['in|side: in is closed (short i); side has silent e (long i)', 'mu|sic: mu ends with u → open → long u', 'sea|son: sea has the team ea → long e', 'toast|er: toast has the team oa → long o'] },
      { t: 'guided', coach: 'Split the word. Look at the first syllable. Does it end with a vowel or a consonant? If it ends with a vowel, it is open and the vowel is long.', q: { k: 'mc', q: 'Zero splits like this: ze|ro.\nWhat kind of syllable is ze?', c: ['open, with a long e', 'closed, with a short e', 'silent e, with a long e'], a: 0, h: 'What is the last letter of ze?', h2: 'Ze ends with the vowel e. A syllable that ends with a vowel is open.', ex: 'Ze is an open syllable. It ends with a vowel, so the e says its name.', why: [null, 'A closed syllable ends with a consonant. Ze ends with the vowel e.', 'Silent e comes after a consonant, like in cake. In ze, you hear the e say its name.'] } },
      { t: 'try', q: { k: 'mc', q: 'Which word has a vowel-team syllable?', c: ['beanbag', 'cobweb', 'pilot'], a: 0, h: 'Look for two vowels side by side in one syllable.', h2: 'The vowel teams you know are ai, ee, ea, and oa. Check each word for one of them.', ex: 'Beanbag splits bean|bag. Bean has the team ea, which says long e.', why: [null, 'Cob|web has two closed syllables. Each has one vowel.', 'Pi|lot has an open syllable (pi), not a vowel team.'] } }
    ] },
    { id: 'K', title: 'Word Study: Prefixes', skill: 'prefix', key: 'A prefix goes at the start of a base word and changes its meaning: un- and dis- mean not, re- means again, pre- means before.', steps: [
      { t: 'explain', title: 'What is a prefix?', text: ['A prefix is a word part added to the START of a base word.', 'A prefix changes what the word means.'], box: ['un + lock → unlock', 're + build → rebuild'] },
      { t: 'table', title: 'Four prefixes to know', head: ['Prefix', 'Meaning', 'Example'], rows: [['un-', 'not, or the opposite of', 'unlock, unhappy'], ['re-', 'again', 'rebuild'], ['pre-', 'before', 'preheat'], ['dis-', 'not, or the opposite of', 'disagree']], text: 'Cover the prefix, read the base word, then add the prefix meaning.' },
      { t: 'explain', title: 'Simple example', text: ['Start with the base word. Then add the prefix meaning.'], box: ['happy means glad', 'un + happy → unhappy', 'unhappy means not happy'] },
      { t: 'explain', title: 'Richer example: in a sentence', text: ['The sentence helps you check the meaning.'], box: ['“Dad will preheat the oven before he bakes the bread.”', 'pre means before, and heat means make hot', 'preheat means heat it before baking'] },
      { t: 'guided', coach: 'Cover the prefix with your finger. Read the base word. Then add the meaning of the prefix.', q: { k: 'mc', q: '“Malik and Ana disagree about which game to play.”\nWhat does disagree mean?', c: ['do not agree', 'agree again', 'agree before'], a: 0, h: 'What is the base word? What does dis- mean?', h2: 'The base word is agree. The prefix dis- means not, or the opposite of.', ex: 'Disagree means do not agree. Malik and Ana want different games.', why: [null, 'Again is the meaning of re-, not dis-.', 'Before is the meaning of pre-, not dis-.'] } },
      { t: 'try', q: { k: 'mc', q: '“My shoelace came loose, so I had to ___ it.”', c: ['retie', 'untie', 'pretie'], a: 0, h: 'The shoelace is loose. What do you need to do to it?', h2: 'You need to tie the lace one more time. Which prefix means again?', ex: 'Retie means tie again. The lace came loose, so you tie it again.', why: [null, 'Untie means undo the knot. The lace is already loose.', 'Pre- means before. Pretie does not fit this sentence.'] } }
    ] },
    { id: 'L', title: 'Word Study: Suffixes', skill: 'suffix', key: 'A suffix goes at the end of a base word and changes its meaning and its job in the sentence.', steps: [
      { t: 'explain', title: 'What is a suffix?', text: ['A suffix is a word part added to the END of a base word.', 'A suffix changes the meaning. It can also change the word’s job in a sentence.'], box: ['care + ful → careful', 'teach + er → teacher'] },
      { t: 'table', title: 'Five suffixes to know', head: ['Suffix', 'Meaning', 'Example', 'Word job'], rows: [['-ful', 'full of', 'careful', 'describing word (adjective)'], ['-less', 'without', 'careless', 'describing word (adjective)'], ['-ly', 'in a ___ way', 'quickly', 'tells how (adverb)'], ['-er', 'a person who', 'teacher', 'naming word (noun)'], ['-ness', 'being ___', 'kindness', 'naming word (noun)']], text: 'Here, -er means a person who. (In taller, -er compares. That is a different job.)' },
      { t: 'explain', title: 'Simple example', text: ['One base word, two suffixes, two very different meanings!'], box: ['care + ful → careful = full of care', 'care + less → careless = without care'] },
      { t: 'explain', title: 'Richer example: the word’s job changes', text: ['Watch how the suffix changes what the word does.'], box: ['“Jordan is quick.” Quick describes Jordan.', '“Jordan runs quickly.” Quickly tells HOW he runs.', '“Ms. Diaz is kind.” → “Thank you for your kindness.” Kindness names a thing.'] },
      { t: 'explain', title: 'One spelling tip', text: ['Many words that end in a consonant and y change the y to i before adding -ness.'], box: ['happy + ness → happiness'] },
      { t: 'guided', coach: 'Find the base word first. Then think: what does the suffix add to the meaning?', q: { k: 'mc', q: '“The baby bird could not fly or find food yet. It was ___.”', c: ['helpless', 'helpful', 'helper'], a: 0, h: 'The bird cannot do things on its own. Does it have help, or is it without help?', h2: 'The suffix -less means without. The suffix -ful means full of.', ex: 'Helpless means without help. The baby bird cannot take care of itself yet.', why: [null, 'Helpful means full of help, like someone who helps others. The bird cannot help yet.', 'Helper means a person who helps. “It was helper” does not make sense here.'] } },
      { t: 'try', q: { k: 'mc', q: '“Brianna spoke ___ to the scared kitten.”', c: ['calmly', 'calmness', 'calmful'], a: 0, h: 'The word tells HOW Brianna spoke. Which suffix makes a tells-how word?', h2: 'The suffix -ly means in a ___ way. It makes words that tell how.', ex: 'Calmly means in a calm way. It tells how Brianna spoke.', why: [null, 'Calmness is a naming word (noun). It does not tell how she spoke.', 'Calmful is not a word. Use -ly to tell how.'] } }
    ] },
    { id: 'M', title: 'Word Study: Spelling Patterns', skill: 'spell', key: 'Spell one syllable at a time, choose the vowel pattern, then check every prefix and suffix.', steps: [
      { t: 'explain', title: 'Spell it one part at a time', text: ['To spell a long word, split it into syllables.', 'Spell one syllable at a time. Then check the whole word.'], box: ['pic|nic → pic + nic → picnic'] },
      { t: 'table', title: 'Pick the pattern', head: ['Sound or part', 'Spellings you know', 'Examples'], rows: [['short vowel', 'one vowel in a closed syllable', 'nap, kin'], ['long a', 'a_e or ai', 'cake, rain'], ['long e', 'ee or ea', 'feet, seat'], ['long o', 'o_e or oa', 'hope, boat'], ['word parts', 'prefix + base + suffix', 'un + help + ful']], text: 'Long sounds can have more than one spelling. Think of a word you know that has the same part.' },
      { t: 'explain', title: 'Simple example', text: ['Both syllables are closed, so both vowels are short.'], box: ['nap + kin → napkin'] },
      { t: 'explain', title: 'Richer example: word parts', text: ['Spell the prefix, the base word, and the suffix. Keep every part.'], box: ['un + help + ful → unhelpful', 'The suffix -ful has only ONE l.'] },
      { t: 'guided', coach: 'Find the base word and the suffix. Check the spelling of each part. Remember: the suffix -ful has only one l.', q: { k: 'fix', s: 'Mr. Owens gave us a [cheerfull] smile.', c: ['cheerful', 'cheerfel', 'chereful'], a: 0, h: 'What is the base word? What is the suffix?', h2: 'The base word cheer keeps its ee. The suffix -ful is spelled f, u, l with just one l.', ex: 'Cheerful = cheer + ful. The suffix -ful has only one l.', why: [null, 'The suffix is spelled -ful, not -fel.', 'Cheer is spelled with ee: c, h, e, e, r.'] } },
      { t: 'try', q: { k: 'fix', s: 'The boat drifted [slowley] down the river.', c: ['slowly', 'sloly', 'slowlie'], a: 0, h: 'What is the base word? What suffix was added?', h2: 'Keep the base word slow just as it is. Then add the suffix -ly.', ex: 'Slowly = slow + ly. The suffix is -ly, not -ley.', why: [null, 'This drops the w from the base word slow. Keep slow whole.', 'The suffix is spelled -ly, not -lie.'] } }
    ] }
  ]
};

/* Word Study practice bank */

var WORD_BANK = [
  /* syll */
  { id: 'w1', sk: 'syll', k: 'mc', q: 'How do you split muffin into syllables?', c: ['muf|fin', 'mu|ffin', 'muff|in'], a: 0, say: true, h: 'Find the vowels first. What letters are between them?', h2: 'The vowels are u and i. Two f letters sit between them, so split between the two f letters.', ex: 'muf|fin. Each syllable has one f and one vowel sound.', why: [null, 'This puts both f letters in the second part. Split between them.', 'This puts both f letters in the first part. Split between them.'] },
  { id: 'w2', sk: 'syll', k: 'mc', q: 'Blend the syllables: in + sect.\nWhat word do you make?', c: ['insect', 'insert', 'inside'], a: 0, h: 'Read each part, then put them together.', h2: 'The second part is sect: s, e, c, t. Keep every letter of both parts.', ex: 'in + sect = insect, a small animal with six legs.', why: [null, 'Insert has an r. The second part here is sect, with a c.', 'Inside is in + side. The second part here is sect.'] },
  { id: 'w3', sk: 'syll', k: 'mc', q: 'How many syllables are in cactus?', c: ['1', '2', '3'], a: 1, say: true, h: 'Count the vowel sounds in the word.', h2: 'Look for the vowels in c, a, c, t, u, s. Each vowel sound makes one syllable.', ex: 'Cactus has 2 syllables: cac|tus. It has two vowel sounds, a and u.', why: ['Cactus has more than one vowel sound. Count the a and the u.', null, 'There are only two vowels in cactus: a and u.'] },
  { id: 'w4', sk: 'syll', k: 'sort', q: 'Sort each word by how many syllables it has.', b: ['1 syllable', '2 syllables'], items: [['tennis', 1], ['tent', 0], ['velvet', 1], ['snack', 0], ['helmet', 1], ['milk', 0]], h: 'Count the vowel sounds in each word.', h2: 'One vowel sound means one syllable. Two vowel sounds mean two syllables.', ex: 'tent, snack, milk have one vowel sound. ten|nis, vel|vet, hel|met have two.' },
  { id: 'w5', sk: 'syll', k: 'mc', q: 'Backpack is a compound word. How do you split it?', c: ['back|pack', 'ba|ckpack', 'backp|ack'], a: 0, h: 'What two small words do you see in backpack?', h2: 'Split a compound word between its two small words. Keep the letters ck together.', ex: 'back|pack. Back and pack are the two small words.', why: [null, 'This breaks up ck. Ck works together, so keep it in one part.', 'Backp and ack are not small words. Find the two small words.'] },
  { id: 'w6', sk: 'syll', k: 'mc', q: 'How do you split basket into syllables?', c: ['bas|ket', 'ba|sket', 'bask|et'], a: 0, say: true, h: 'Find the vowels. How many consonants are between them?', h2: 'The vowels are a and e. The consonants s and k sit between them. Split between those two.', ex: 'bas|ket. Split between s and k. Bas is closed, so the a is short.', why: [null, 'Ba would end with a vowel and make a long a. Basket has a short a, so split between s and k.', 'This puts both s and k in the first part. Split between them.'] },
  { id: 'w7', sk: 'syll', k: 'mc', q: 'Which one is a compound word made of two small words?', c: ['bathtub', 'basket', 'tennis'], a: 0, h: 'Can you find two whole words inside it?', h2: 'Try to cover part of each word. Is each part a real word by itself?', ex: 'Bathtub is bath + tub. Both parts are real words.', why: [null, 'Bas and ket are syllables, but they are not real words.', 'Ten is a word, but nis is not. Tennis is not a compound word.'] },
  { id: 'w8', sk: 'syll', k: 'mc', q: 'Rab|bit splits between two of the SAME letter.\nWhich word splits the same way?', c: ['ten|nis', 'vel|vet', 'in|sect'], a: 0, h: 'Look at the two letters on each side of the line.', h2: 'In rab|bit, the line goes between b and b. Find a word where the two letters by the line match.', ex: 'Ten|nis splits between n and n, the same letter, just like rab|bit.', why: [null, 'Vel|vet splits between l and v. They are different letters.', 'In|sect splits between n and s. They are different letters.'] },
  /* across */
  { id: 'w9', sk: 'across', k: 'mc', q: 'Paper splits like this: pa|per.\nThe syllable pa ends with a vowel. What does the a say?', c: ['long a, like in cake', 'short a, like in cat'], a: 0, say: true, h: 'Is pa an open syllable or a closed syllable?', h2: 'Pa ends with a vowel, so it is open. An open syllable usually has a long vowel.', ex: 'Pa is open, so the a says its name: long a.', why: [null, 'A short a comes in a closed syllable, like cat. Pa ends with a vowel, so it is open.'] },
  { id: 'w10', sk: 'across', k: 'mc', q: 'Which word has an OPEN first syllable?', c: ['pilot', 'pumpkin', 'pigpen'], a: 0, say: true, h: 'Split each word. Does the first syllable end with a vowel?', h2: 'Pi|lot, pump|kin, pig|pen. Look at the last letter of each first syllable.', ex: 'Pi|lot: pi ends with the vowel i, so it is open and the i is long.', why: [null, 'Pump ends with a consonant, so it is closed.', 'Pig ends with a consonant, so it is closed.'] },
  { id: 'w11', sk: 'across', k: 'sort', q: 'Look at the FIRST syllable. Sort each word.', b: ['Closed (short vowel)', 'Open (long vowel)'], items: [['silent', 1], ['happen', 0], ['open', 1], ['laptop', 0], ['even', 1], ['sudden', 0]], h: 'Split each word. Does the first syllable end with a vowel or a consonant?', h2: 'Si|lent, o|pen, e|ven have first syllables that end with a vowel. Hap|pen, lap|top, sud|den do not.', ex: 'Open: si, o, e (long vowels). Closed: hap, lap, sud (short vowels).' },
  { id: 'w12', sk: 'across', k: 'sort', q: 'Sort each word by the long-vowel syllable it has.', b: ['Has a silent e syllable', 'Has a vowel team syllable'], items: [['pancake', 0], ['railroad', 1], ['bedtime', 0], ['sailboat', 1], ['pinecone', 0], ['peanut', 1]], h: 'Does a syllable end in e, or does it have two vowels side by side?', h2: 'Silent e syllables look like cake and time. Vowel teams are ai, ee, ea, oa.', ex: 'pan|cake, bed|time, pine|cone have silent e. rail|road, sail|boat, pea|nut have vowel teams.' },
  { id: 'w13', sk: 'across', k: 'mc', q: 'Railroad splits like this: rail|road.\nWhich vowel teams does it have?', c: ['ai and oa', 'ai and ee', 'ea and oa'], a: 0, h: 'Look at the two vowels side by side in each syllable.', h2: 'Rail has a and i together. Road has o and a together.', ex: 'Rail has ai (long a) and road has oa (long o).', why: [null, 'There is no ee in railroad. Look at road again.', 'There is no ea in railroad. Look at rail again.'] },
  { id: 'w14', sk: 'across', k: 'mc', q: 'In bed|time, which syllable has a silent e?', c: ['time', 'bed', 'both'], a: 0, h: 'Which syllable ends with an e you do not hear?', h2: 'Silent e comes after one consonant at the end of a syllable, like in kite, and you do not hear it. Check each syllable for that pattern.', ex: 'Time has the silent e, so the i says its name. Bed is closed, so the e is short.', why: [null, 'You hear the short e in bed. It is a closed syllable.', 'Only one syllable has a silent e. Bed is closed.'] },
  { id: 'w15', sk: 'across', k: 'mc', q: 'Weekend splits like this: week|end.\nWhat kind of syllable is week?', c: ['vowel team', 'open', 'silent e'], a: 0, h: 'What two letters sit side by side in week?', h2: 'Week has ee in the middle. Two vowels working together make a team.', ex: 'Week has the team ee, which says long e. It is a vowel team syllable.', why: [null, 'An open syllable ends with a vowel. Week ends with k.', 'Week does not end in e. The e letters are in the middle as a team.'] },
  { id: 'w16', sk: 'across', k: 'mc', q: 'Which word’s first syllable has a long o?', c: ['open', 'object', 'oddly'], a: 0, say: true, h: 'Split each word. Is the first syllable open or closed?', h2: 'Split each word into syllables. If the first syllable ends with a vowel, that vowel usually says its name.', ex: 'O|pen: the first syllable is just o. It is open, so the o says its name.', why: [null, 'Ob ends with b, so it is closed and the o is short.', 'Odd ends with d, so it is closed and the o is short.'] },
  /* prefix */
  { id: 'w17', sk: 'prefix', k: 'mc', q: 'What does unsafe mean?', c: ['not safe', 'safe again', 'safe before'], a: 0, h: 'Cover the prefix. What is the base word? What does un- mean?', h2: 'The base word is safe. The prefix un- means not, or the opposite of.', ex: 'Unsafe means not safe.', why: [null, 'Again is the meaning of re-.', 'Before is the meaning of pre-.'] },
  { id: 'w18', sk: 'prefix', k: 'mc', q: '“Jada drank all her water. She will ___ her cup.”', c: ['refill', 'unfill', 'prefill'], a: 0, h: 'Her cup is empty. What will she do to it?', h2: 'She will fill the cup one more time. Which prefix means again?', ex: 'Refill means fill again. Jada fills her cup again.', why: [null, 'Un- means not or the opposite. Unfill does not fit here.', 'Pre- means before. She is filling it again, not before.'] },
  { id: 'w19', sk: 'prefix', k: 'mc', q: '“Marcus liked the story so much that he wanted to ___ it.”', c: ['reread', 'unread', 'preread'], a: 0, h: 'He already read the story. What does he want to do now?', h2: 'He wants to read it one more time. Which prefix means again?', ex: 'Reread means read again. Marcus wants to read the story again.', why: [null, 'Unread means not read yet. Marcus already read it.', 'Pre- means before. He already read it, so he wants to read it again.'] },
  { id: 'w20', sk: 'prefix', k: 'mc', q: '“Tia likes peas, but she ___ beans.”', c: ['dislikes', 'relikes', 'prelikes'], a: 0, h: 'The word but tells you something is different. How does Tia feel about beans?', h2: 'She does the opposite of like. Which prefix means not, or the opposite of?', ex: 'Dislikes means does not like. Tia likes peas but not beans.', why: [null, 'Re- means again. That does not show the opposite.', 'Pre- means before. That does not show the opposite.'] },
  { id: 'w21', sk: 'prefix', k: 'mc', q: '“Before we started the unit, our class took a ___ to see what we knew.”', c: ['pretest', 'retest', 'untest'], a: 0, h: 'Look for a clue word that tells WHEN the test happened.', h2: 'The clue word is before. Which prefix means before?', ex: 'Pretest means a test before. The class took it before the unit started.', why: [null, 'Retest means test again. This test came before the unit.', 'Untest is not a word. The clue is before.'] },
  { id: 'w22', sk: 'prefix', k: 'sort', q: 'Sort each word by its prefix meaning.', b: ['un- (not, or the opposite)', 're- (again)'], items: [['unpack', 0], ['retell', 1], ['unfold', 0], ['replant', 1], ['unsafe', 0], ['refill', 1]], h: 'Look at the start of each word. Is it un- or re-?', h2: 'Un- turns the meaning around. Re- means do it one more time.', ex: 'unpack, unfold, unsafe use un-. retell, replant, refill use re- (again).' },
  { id: 'w23', sk: 'prefix', k: 'mc', q: 'What is the base word in disconnect?', c: ['connect', 'dis', 'disconnect'], a: 0, h: 'Cover the prefix. What word is left?', h2: 'Dis- is the prefix. The base word is the part that is left over.', ex: 'The base word is connect. Disconnect means the opposite of connect.', why: [null, 'Dis- is the prefix, not the base word.', 'That is the whole word. Take off the prefix to find the base word.'] },
  { id: 'w24', sk: 'prefix', k: 'mc', q: 'Which prefix means before?', c: ['pre-', 're-', 'un-'], a: 0, h: 'Think of preheat. What do you do before you bake?', h2: 'In preheat, you heat the oven before baking. Which prefix is in that word?', ex: 'Pre- means before, like in preheat.', why: [null, 'Re- means again, like in rebuild.', 'Un- means not, or the opposite, like in unlock.'] },
  /* suffix */
  { id: 'w25', sk: 'suffix', k: 'mc', q: 'What does fearless mean?', c: ['without fear', 'full of fear', 'a person who fears'], a: 0, h: 'Find the base word. What does -less mean?', h2: 'The base word is fear. The suffix -less means without.', ex: 'Fearless means without fear, or very brave.', why: [null, 'Full of is the meaning of -ful.', 'A person who is the meaning of -er.'] },
  { id: 'w26', sk: 'suffix', k: 'mc', q: '“Keisha whispered ___ so the baby could sleep.”', c: ['softly', 'softness', 'softful'], a: 0, h: 'The missing word tells HOW Keisha whispered.', h2: 'Words that tell how often end in -ly, which means in a ___ way.', ex: 'Softly means in a soft way. It tells how she whispered.', why: [null, 'Softness is a naming word (noun). It does not tell how.', 'Softful is not a word. Use -ly to tell how.'] },
  { id: 'w27', sk: 'suffix', k: 'mc', q: 'A person who paints is a ___.', c: ['painter', 'painful', 'paintless'], a: 0, h: 'Which suffix means a person who?', h2: 'Think of teacher: a person who teaches. Use the same suffix with paint.', ex: 'Painter = paint + er, a person who paints.', why: [null, 'Painful means full of pain. It is not a person.', 'Paintless would mean without paint. It is not a person.'] },
  { id: 'w28', sk: 'suffix', k: 'sort', q: 'Sort each word by its suffix meaning.', b: ['-ful (full of)', '-less (without)'], items: [['helpful', 0], ['sleepless', 1], ['thankful', 0], ['hopeless', 1], ['joyful', 0], ['painless', 1]], h: 'Look at the end of each word. Is it -ful or -less?', h2: 'Words with -ful have a lot of something. Words with -less have none of it.', ex: 'helpful, thankful, joyful use -ful. sleepless, hopeless, painless use -less.' },
  { id: 'w29', sk: 'suffix', k: 'mc', q: '“Nia’s ___ went away when her best friend called.”', c: ['sadness', 'sadly', 'sadful'], a: 0, h: 'The missing word names a thing that went away. Which suffix makes a naming word?', h2: 'The suffix -ness turns a describing word into a naming word (noun).', ex: 'Sadness names the feeling. It went away when her friend called.', why: [null, 'Sadly tells how. The sentence needs a naming word.', 'Sadful is not a word. Use -ness to name the feeling.'] },
  { id: 'w30', sk: 'suffix', k: 'mc', q: 'Add -ness to silly. Which spelling is correct?', c: ['silliness', 'sillyness', 'sillness'], a: 0, h: 'Silly ends with a consonant and y. What spelling tip did you learn?', h2: 'Many words that end in a consonant and y change the y to i before -ness, like happy → happiness.', ex: 'silly + ness = silliness. The y changes to i.', why: [null, 'Change the y to i before adding -ness.', 'Do not drop the y. Change it to i.'] },
  { id: 'w31', sk: 'suffix', k: 'mc', q: 'Which word means in a loud way?', c: ['loudly', 'loudness', 'louder'], a: 0, h: 'Which suffix means in a ___ way?', h2: 'The suffix -ly makes tells-how words, like quickly.', ex: 'Loudly means in a loud way.', why: [null, 'Loudness names a thing: how loud something is.', 'Louder compares two things. It does not mean in a loud way.'] },
  { id: 'w32', sk: 'suffix', k: 'mc', q: '“Kiara is a great reader.”\nWhat does reader mean?', c: ['a person who reads', 'reading again', 'without reading'], a: 0, h: 'Find the base word and the suffix.', h2: 'The base word is read. Here the suffix -er means a person who.', ex: 'A reader is a person who reads.', why: [null, 'Again is the meaning of the prefix re-.', 'Without is the meaning of the suffix -less.'] },
  /* spell */
  { id: 'w33', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“A bee flew back to its ___.”', c: ['beehive', 'beahive', 'beehiv'], a: 0, h: 'Split it: bee + hive. Spell each part.', h2: 'The insect word bee is spelled with two e letters. Hive needs a silent e to make the long i.', ex: 'Beehive = bee + hive. Bee has ee, and hive has silent e.', why: [null, 'The word bee is spelled with ee, not ea.', 'Hive needs a silent e at the end to make the long i.'] },
  { id: 'w34', sk: 'spell', k: 'fix', s: 'We found a pink [seeshell] on the beach.', c: ['seashell', 'seshell', 'seashel'], a: 0, h: 'Split the word into two small words. Which sea is it?', h2: 'The ocean is the sea, spelled with ea. The word see with ee means look.', ex: 'Seashell = sea + shell. The ocean word sea is spelled with ea.', why: [null, 'Long e needs two letters here: sea.', 'Shell ends with two l letters.'] },
  { id: 'w35', sk: 'spell', k: 'fix', s: 'I am [thankfull] for my friends.', c: ['thankful', 'thankfel', 'thanful'], a: 0, h: 'What is the base word? What is the suffix?', h2: 'Keep the base word thank. The suffix -ful has only one l.', ex: 'Thankful = thank + ful. The suffix -ful has only one l.', why: [null, 'The suffix is spelled -ful, not -fel.', 'Keep the k in the base word thank.'] },
  { id: 'w36', sk: 'spell', k: 'fix', s: 'A squirrel sat on the [tretop] all day.', c: ['treetop', 'treatop', 'tretope'], a: 0, h: 'Split the compound word into two small words.', h2: 'Tree + top. The word tree ends with ee.', ex: 'Treetop = tree + top. Tree is spelled with ee.', why: [null, 'A treat is something tasty. The plant word tree is spelled with ee.', 'Top is a closed syllable with a short o. It does not need a silent e.'] },
  { id: 'w37', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“A ___ hopped into the pond.”', c: ['toad', 'tode', 'tod'], a: 0, h: 'Toad has a long o. Which long o spelling do you know for this word?', h2: 'Long o can be spelled o_e or oa. This animal word uses the team oa, like boat.', ex: 'Toad is spelled with the team oa, like boat and road.', why: [null, 'Tode uses silent e, but this word uses the team oa.', 'Tod has a short o. Toad has a long o.'] },
  { id: 'w38', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“We played ___ after school.”', c: ['tennis', 'tenis', 'tennes'], a: 0, h: 'Split it into syllables: ten|nis. Spell each part.', h2: 'The first syllable ten has a short e, so it is closed. The second part nis starts with another n.', ex: 'Tennis = ten + nis. It has two n letters, one in each syllable.', why: [null, 'Each syllable needs its own n: ten + nis.', 'The second syllable is nis, with an i.'] },
  { id: 'w39', sk: 'spell', k: 'sort', q: 'Sort each word by how the long e is spelled.', b: ['ee', 'ea'], items: [['sweet', 0], ['peach', 1], ['green', 0], ['dream', 1], ['street', 0], ['clean', 1]], h: 'Look at the two vowels in the middle of each word.', h2: 'Both teams say long e. Check the letters: two e letters, or e then a?', ex: 'sweet, green, street use ee. peach, dream, clean use ea.' },
  { id: 'w40', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“The kids played ___ in the snow.”', c: ['happily', 'happyly', 'hapily'], a: 0, h: 'The base word is happy. What happens to the y?', h2: 'Happy ends with a consonant and y. Change the y to i, then add the suffix.', ex: 'happy + ly = happily. The y changes to i, and the two p letters stay.', why: [null, 'Change the y to i before adding the suffix.', 'Keep both p letters from happy.'] },
  { id: 'w41', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“Please ___ your coat and hang it up.”', c: ['unzip', 'unnzip', 'unzipe'], a: 0, h: 'Split it: prefix + base word. Spell each part.', h2: 'The prefix un- has one n. Zip is a closed syllable with a short i.', ex: 'Unzip = un + zip.', why: [null, 'The prefix un- has only one n.', 'Zip has a short i, so it does not need a silent e.'] }
];

/* Word Study check bank (Check My Skills only) */

var WORD_CHECK = [
  /* syll */
  { id: 'wc1', sk: 'syll', k: 'mc', q: 'How do you split mitten into syllables?', c: ['mit|ten', 'mi|tten', 'mitt|en'], a: 0, h: 'Find the vowels. What letters are between them?', h2: 'The vowels are i and e. Two t letters sit between them, so split between them.', ex: 'mit|ten. Each syllable gets one t and one vowel sound.', why: [null, 'This puts both t letters in the second part.', 'This puts both t letters in the first part.'] },
  { id: 'wc2', sk: 'syll', k: 'mc', q: 'Blend the syllables: pup + pet.\nWhat word do you make?', c: ['puppet', 'pupet', 'puppy'], a: 0, h: 'Read each part, then put them together.', h2: 'Keep every letter of both parts: pup and pet.', ex: 'pup + pet = puppet.', why: [null, 'This drops a p. Each part has its own p.', 'Puppy ends with y. The second part here is pet.'] },
  { id: 'wc3', sk: 'syll', k: 'mc', q: 'Hilltop is a compound word. How do you split it?', c: ['hill|top', 'hi|lltop', 'hillto|p'], a: 0, h: 'What two small words do you see?', h2: 'Split a compound word between its two small words.', ex: 'hill|top. Hill and top are the two small words.', why: [null, 'Hi is not the first small word. Find the two small words.', 'P alone has no vowel sound, so it cannot be a syllable.'] },
  { id: 'wc4', sk: 'syll', k: 'mc', q: 'How many syllables are in fantastic?', c: ['2', '3', '4'], a: 1, h: 'Count the vowel sounds.', h2: 'Find each vowel in f, a, n, t, a, s, t, i, c. Each vowel sound is one syllable.', ex: 'Fantastic has 3 syllables: fan|tas|tic.', why: ['Count again: a, a, and i are three vowel sounds.', null, 'There are only three vowels: a, a, i.'] },
  { id: 'wc5', sk: 'syll', k: 'sort', q: 'Sort each word by how many syllables it has.', b: ['1 syllable', '2 syllables'], items: [['magnet', 1], ['drum', 0], ['dentist', 1], ['fast', 0], ['plastic', 1], ['stamp', 0]], h: 'Count the vowel sounds in each word.', h2: 'One vowel sound means one syllable. Two vowel sounds mean two.', ex: 'drum, fast, stamp have one vowel sound. mag|net, den|tist, plas|tic have two.' },
  /* across */
  { id: 'wc6', sk: 'across', k: 'mc', q: 'Which word has an open first syllable with a long u?', c: ['human', 'hundred', 'hubcap'], a: 0, h: 'Split each word. Does the first syllable end with a vowel?', h2: 'Hu|man, hun|dred, hub|cap. An open syllable ends with a vowel and has a long vowel.', ex: 'Hu|man: hu ends with u, so it is open and the u says its name.', why: [null, 'Hun ends with n, so it is closed and the u is short.', 'Hub ends with b, so it is closed and the u is short.'] },
  { id: 'wc7', sk: 'across', k: 'sort', q: 'Look at the FIRST syllable. Sort each word.', b: ['Closed (short vowel)', 'Open (long vowel)'], items: [['bacon', 1], ['mascot', 0], ['moment', 1], ['contest', 0], ['rodent', 1], ['tadpole', 0]], h: 'Split each word. Does the first syllable end with a vowel or a consonant?', h2: 'Ba|con, mo|ment, ro|dent. Mas|cot, con|test, tad|pole.', ex: 'Open: ba, mo, ro (long vowels). Closed: mas, con, tad (short vowels).' },
  { id: 'wc8', sk: 'across', k: 'mc', q: 'Mistake splits like this: mis|take.\nWhich syllable has a silent e?', c: ['take', 'mis', 'neither'], a: 0, h: 'Which syllable ends with an e you do not hear?', h2: 'A silent e syllable has a vowel, a consonant, then e, like cake.', ex: 'Take has the silent e, so the a says its name. Mis is closed.', why: [null, 'Mis ends with s. It is a closed syllable with a short i.', 'Look again at the end of the word: take ends with silent e.'] },
  { id: 'wc9', sk: 'across', k: 'mc', q: 'Which word has TWO vowel-team syllables?', c: ['seaweed', 'sunrise', 'mailbox'], a: 0, h: 'Split each word. Look for two vowels side by side in each part.', h2: 'The vowel teams you know are ai, ee, ea, oa. Check both syllables of each word.', ex: 'Sea|weed: sea has ea and weed has ee. Both are vowel teams.', why: [null, 'Sun is closed and rise has silent e. There are no vowel teams.', 'Mail has ai, but box is closed. Only one team.'] },
  { id: 'wc10', sk: 'across', k: 'mc', q: 'Teapot splits like this: tea|pot.\nWhat kind of syllable is tea?', c: ['vowel team, long e', 'open, short e', 'closed, short e'], a: 0, h: 'What two letters sit side by side in tea?', h2: 'Tea has e and a together. Two vowels working together make a team.', ex: 'Tea has the team ea, which says long e.', why: [null, 'Tea has two vowels together, so it is a vowel team. And you hear a long e.', 'A closed syllable ends with a consonant. Tea ends with a vowel.'] },
  { id: 'wc11', sk: 'across', k: 'mc', q: 'Raincoat splits like this: rain|coat.\nWhat sound does oa make in coat?', c: ['long o', 'short o', 'long a'], a: 0, h: 'What does the team oa say?', h2: 'The team oa says the same sound as in boat and road.', ex: 'Oa says long o, so coat has a long o.', why: [null, 'Short o comes in a closed syllable with one vowel, like cot.', 'The a is part of the team oa. The team says long o.'] },
  /* prefix */
  { id: 'wc12', sk: 'prefix', k: 'mc', q: '“Before kindergarten, my little brother goes to ___.”', c: ['preschool', 'reschool', 'unschool'], a: 0, h: 'Look for a clue word that tells WHEN.', h2: 'The clue word is before. Which prefix means before?', ex: 'Preschool means the school before kindergarten.', why: [null, 'Re- means again. This school comes before kindergarten.', 'Un- means not. The clue word is before.'] },
  { id: 'wc13', sk: 'prefix', k: 'mc', q: '“The magician waved her hand, and the coin was gone. She made it ___.”', c: ['disappear', 'reappear', 'preappear'], a: 0, h: 'Was the coin there or gone at the end?', h2: 'The coin was gone, so it did the opposite of appear. Which prefix means not, or the opposite of?', ex: 'Disappear means the opposite of appear. The coin was gone.', why: [null, 'Reappear means appear again. The coin was gone.', 'Pre- means before. That does not fit.'] },
  { id: 'wc14', sk: 'prefix', k: 'mc', q: '“When the game was over, Dev had to unplug the TV.”\nWhat does unplug mean?', c: ['pull out the plug', 'plug in again', 'plug in before'], a: 0, h: 'Find the base word. What does un- mean?', h2: 'Un- can mean the opposite of. What is the opposite of plug in?', ex: 'Unplug means the opposite of plug in. Dev pulls out the plug.', why: [null, 'Again is the meaning of re-.', 'Before is the meaning of pre-.'] },
  { id: 'wc15', sk: 'prefix', k: 'mc', q: '“The game was so fun that we want to ___ it.”', c: ['replay', 'unplay', 'preplay'], a: 0, h: 'They already played. What do they want to do now?', h2: 'They want to play one more time. Which prefix means again?', ex: 'Replay means play again.', why: [null, 'Un- means not or the opposite. That does not fit.', 'Pre- means before. They already played the game.'] },
  { id: 'wc16', sk: 'prefix', k: 'mc', q: 'What does unfair mean?', c: ['not fair', 'fair again', 'fair before'], a: 0, h: 'Cover the prefix. What does un- mean?', h2: 'The base word is fair. The prefix un- means not.', ex: 'Unfair means not fair.', why: [null, 'Again is the meaning of re-.', 'Before is the meaning of pre-.'] },
  /* suffix */
  { id: 'wc17', sk: 'suffix', k: 'mc', q: '“The kitten was ___ and batted at the yarn all day.”', c: ['playful', 'playless', 'player'], a: 0, h: 'The kitten played a lot. Is it full of play or without play?', h2: 'The suffix -ful means full of. The suffix -less means without.', ex: 'Playful means full of play. The kitten played all day.', why: [null, 'Playless would mean without play. The kitten played a lot.', 'Player means a person who plays. “The kitten was player” does not make sense.'] },
  { id: 'wc18', sk: 'suffix', k: 'mc', q: 'What does spotless mean?', c: ['without spots, very clean', 'full of spots', 'a person who spots'], a: 0, h: 'Find the base word. What does -less mean?', h2: 'The base word is spot. The suffix -less means without.', ex: 'Spotless means without spots, so it is very clean.', why: [null, 'Full of is the meaning of -ful.', 'A person who is the meaning of -er.'] },
  { id: 'wc19', sk: 'suffix', k: 'mc', q: '“Omar wrote his name ___ on the card.”', c: ['neatly', 'neatness', 'neatful'], a: 0, h: 'The missing word tells HOW Omar wrote.', h2: 'The suffix -ly means in a ___ way. It makes words that tell how.', ex: 'Neatly means in a neat way. It tells how he wrote.', why: [null, 'Neatness is a naming word. It does not tell how.', 'Neatful is not a word. Use -ly to tell how.'] },
  { id: 'wc20', sk: 'suffix', k: 'mc', q: 'A person who sings is a ___.', c: ['singer', 'singness', 'singful'], a: 0, h: 'Which suffix means a person who?', h2: 'Think of teacher: a person who teaches. Use the same suffix with sing.', ex: 'Singer = sing + er, a person who sings.', why: [null, 'Singness is not a word. Use -er for a person.', 'Singful is not a word. Use -er for a person.'] },
  { id: 'wc21', sk: 'suffix', k: 'mc', q: '“We loved the ___ of the ripe peach.”', c: ['sweetness', 'sweetly', 'sweetful'], a: 0, h: 'The missing word names a thing. Which suffix makes a naming word?', h2: 'The suffix -ness turns a describing word into a naming word (noun).', ex: 'Sweetness names how sweet the peach was.', why: [null, 'Sweetly tells how. The sentence needs a naming word after the.', 'Sweetful is not a word. Use -ness to name it.'] },
  /* spell */
  { id: 'wc22', sk: 'spell', k: 'fix', s: 'Please speak [kindley] to your little brother.', c: ['kindly', 'kindlee', 'kinly'], a: 0, h: 'What is the base word? What is the suffix?', h2: 'Keep the base word kind. The suffix is spelled -ly.', ex: 'Kindly = kind + ly.', why: [null, 'The suffix is spelled -ly, not -lee.', 'Keep the d in the base word kind.'] },
  { id: 'wc23', sk: 'spell', k: 'fix', s: 'A [gote] chewed the grass at the farm.', c: ['goat', 'gaot', 'got'], a: 0, h: 'The animal word has a long o. Which long o spelling does it use?', h2: 'Long o can be o_e or oa. This animal word uses the team oa, like boat.', ex: 'Goat is spelled with the team oa.', why: [null, 'The team is oa: o first, then a.', 'Got has a short o. The animal word has a long o.'] },
  { id: 'wc24', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“Grandpa sat in the warm ___ to read.”', c: ['sunshine', 'sunshin', 'sonshine'], a: 0, h: 'Split the compound word: sun + shine. Spell each part.', h2: 'Sun is closed with a short u. Shine needs a silent e for the long i.', ex: 'Sunshine = sun + shine.', why: [null, 'Shine needs a silent e at the end for the long i.', 'The first small word is sun, spelled with u.'] },
  { id: 'wc25', sk: 'spell', k: 'mc', q: 'Add -ness to messy. Which spelling is correct?', c: ['messiness', 'messyness', 'mesiness'], a: 0, h: 'Messy ends with a consonant and y. What spelling tip did you learn?', h2: 'Change the y to i before adding -ness, like happy → happiness.', ex: 'messy + ness = messiness.', why: [null, 'Change the y to i before adding -ness.', 'Keep both s letters from messy.'] },
  { id: 'wc26', sk: 'spell', k: 'sort', q: 'Sort each word by how the long o is spelled.', b: ['o_e (silent e)', 'oa (vowel team)'], items: [['stone', 0], ['coach', 1], ['smoke', 0], ['float', 1], ['globe', 0], ['roast', 1]], h: 'Does the word end in e, or does it have o and a together?', h2: 'Silent e words end with a vowel, a consonant, then e. Team words have oa in the middle.', ex: 'stone, smoke, globe use silent e. coach, float, roast use oa.' },
  { id: 'wc27', sk: 'spell', k: 'mc', q: 'Choose the correct spelling.\n“It is ___ to laugh when a friend falls down.”', c: ['unkind', 'unnkind', 'unkinde'], a: 0, h: 'Split it: prefix + base word. Spell each part.', h2: 'The prefix un- has one n. Keep the base word kind just as it is.', ex: 'Unkind = un + kind. It means not kind.', why: [null, 'The prefix un- has only one n.', 'Kind does not end in e. Keep the base word just as it is.'] }
];

var LESSONS_REPLACE_BRIDGES = {
  verbs: [
    { id: 'A', title: 'Action Verbs', skill: 'action', key: 'A verb can tell what someone or something does.', steps: [
      { t: 'explain', title: 'Action verbs', text: ['A verb can tell what someone or something does.', 'Some actions you can see, like run and throw.', 'Some actions happen in your head, like think and learn.'] },
      { t: 'show', img: 'verbs', title: 'Watch me find it', mode: 'verb', s: 'Chris [swings] the bat.', labels: { swings: 'verb' }, text: ['Swings tells what Chris does.', 'We draw TWO lines under a verb.'] },
      { t: 'words', title: 'Action words to know', groups: [ { name: 'Body actions', words: ['run', 'jump', 'throw', 'catch', 'swing'] }, { name: 'Word actions', words: ['read', 'write', 'talk'] }, { name: 'Thinking actions', words: ['think', 'know', 'learn'] } ], text: ['Act out one body action.', 'Thinking actions happen in your brain. They are verbs too!'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'Every afternoon, Jasmine [waters] the tall sunflowers beside her grandmother’s porch.', labels: { waters: 'verb', sunflowers: 'thing' }, text: ['A longer sentence still has one action. Ask: What does Jasmine do?', 'Waters tells what she does, so it is the verb.', 'Afternoon, tall, sunflowers, and porch do not show an action. Skip them.'] },
      { t: 'guided', coach: 'What does the dog do? Tap that word.', q: { mode: 'verb', s: 'The dog [runs] outside.', ask: 'What does the dog do?', h: 'The dog is doing something. Which word tells what it does?', h2: 'Picture the dog. Outside tells where it is, so look for the word that shows what its legs are doing.', ex: 'Runs tells what the dog does. Runs is the verb.', notes: { outside: 'Outside tells WHERE the dog runs. It is not a verb.', dog: 'Dog names an animal. Which word tells what it DOES?' } } },
      { t: 'try', q: { mode: 'verb', s: 'Mom [cooks] dinner.', ask: 'What does Mom do?', h: 'Dinner is the food. Which word is the action?', h2: 'Mom is the person and dinner is the food. The verb is the word in between that tells what Mom does with the food.', ex: 'Cooks tells what Mom does.', notes: { dinner: 'Dinner is a thing (a noun). What does Mom DO?' } } },
      { t: 'try', q: { mode: 'verb', s: 'I [think] about baseball.', ask: 'What do I do?', h: 'This action happens in your head.', h2: 'Baseball is a game, a thing. Look for the word that tells what my brain is doing.', ex: 'Think is a thinking action. It is a verb.', notes: { baseball: 'Baseball is a thing (a game). Find the action.' } } },
      { t: 'try', q: { mode: 'verb', s: 'During the long bus ride, Malik [read] a funny comic book about pirates.', ask: 'What did Malik do?', h: 'Ask: What did Malik do on the bus?', h2: 'Ride can be a verb, but here it is the bus ride, a thing. Look after Malik for the word that tells what he did with the comic book.', ex: 'Read tells what Malik did. It is the only verb in the sentence.', notes: { ride: 'Here ride is a thing (the bus ride), so it is a noun, not a verb.', funny: 'Funny describes the comic book. It is not a verb.', pirates: 'Pirates are people (a noun).', long: 'Long describes the ride. It is not a verb.' } } }
    ] },
    { id: 'B', title: 'Being Verbs', skill: 'being', key: 'Some verbs tell about being: am, is, are, was, were.', steps: [
      { t: 'explain', title: 'Being verbs', text: ['Some verbs tell about being.', 'They do not show an action you can watch.', 'Being verbs include am, is, are, was, and were.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'He [is] happy.', labels: { is: 'being verb', happy: 'describes him' }, text: ['Is tells about being.', 'Happy describes him. Happy is not a verb.'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'After the long game, my baseball cap [was] wet and dirty.', labels: { was: 'being verb', wet: 'describes the cap', dirty: 'describes the cap' }, text: ['Nobody does an action in this sentence.', 'Look for a BE word: am, is, are, was, were. Was links the cap to wet and dirty.', 'Wet and dirty describe the cap. They are not verbs.'] },
      { t: 'compare', title: 'Is can work two ways', items: [ { mode: 'verb', s: 'He [is] happy.', line: 'Is stands alone. The verb is: is' }, { mode: 'verb', s: 'He [is] [running].', line: 'Is helps running. The verb is: is running' } ], text: ['Is can stand alone, or it can help another verb.'] },
      { t: 'guided', coach: 'Which word tells about being? Tap it.', q: { mode: 'verb', s: 'I [am] ready.', h: 'Look for a BE word: am, is, are, was, were.', h2: 'Ready tells how I feel, so it describes me. Find the small word that links I to ready.', ex: 'Am is the being verb. Ready describes me.', notes: { ready: 'Ready describes me. It is not a verb.' } } },
      { t: 'try', q: { mode: 'verb', s: 'The ball [was] in the grass.', h: 'Look for a BE word.', h2: 'The ball is not doing anything. Find the BE word that links the ball to where it is.', ex: 'Was is the being verb. It is the only verb in the sentence.', notes: { grass: 'Grass is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: 'She [is] [running].', ask: 'What is she doing?', h: 'Here is helps another verb. Find both words.', h2: 'An -ing verb needs a helper in front of it. Tap the helper and the -ing word together.', ex: 'Is helps running. The verb is: is running.' } },
      { t: 'try', q: { mode: 'verb', s: 'My twin cousins from Atlanta [are] excited about the school talent show.', h: 'Is anyone doing an action you can watch? Look for a BE word.', h2: 'Excited has -ed, but it tells how the cousins feel, so it describes them. Show is a thing here. Find the BE word that links the cousins to excited.', ex: 'Are is the being verb. Excited describes the cousins, and show is a thing.', notes: { excited: 'Excited describes the cousins. The -ed ending does not make it a verb here.', show: 'Here show is an event (a thing), so it is a noun, not a verb.', twin: 'Twin describes the cousins. It is not a verb.' } } }
    ] },
    { id: 'C', title: 'Memorize the Helpers', skill: 'helpers', key: 'There are 23 helping verbs in four families.', steps: [
      { t: 'explain', title: 'Helping verbs', text: ['Some short verbs can help another verb.', 'There are 23 of them, in four families.', 'Learn one family at a time. You do not need them all today!'] },
      { t: 'cards' },
      { t: 'mc', q: { q: 'BE family: am, is, are, ___, were', c: ['has', 'was', 'can'], a: 1, h: 'Say the chant: am, is, are, ...', h2: 'The BE family tells about being. The missing word goes with were, like a pair: one tells about one person in the past, one tells about many.', ex: 'am, is, are, WAS, were.' } },
      { t: 'mc', q: { q: 'HAVE family: have, ___, had', c: ['has', 'is', 'did'], a: 0, h: 'It starts with h, like have and had.', h2: 'Think: She ___ a dog. You need the HAVE word that goes with she or he.', ex: 'have, HAS, had.' } },
      { t: 'mc', q: { q: 'OTHER HELPERS: can, could, may, ___, must', c: ['might', 'were', 'does'], a: 0, h: 'It starts with m, like may and must.', h2: 'The other helpers come in pairs that sound alike: can and could, then may and its partner. Two of the choices belong to other families.', ex: 'can, could, may, MIGHT, must.' } },
      { t: 'compare', title: 'Not always helpers! Have can work two ways', items: [ { mode: 'verb', s: 'I [have] a glove.', line: 'Have is the main verb. Nothing comes after it to help.' }, { mode: 'verb', s: 'I [have] [packed] my bag.', line: 'Have helps packed. The verb team is: have packed' } ], text: ['These words do not ALWAYS help.', 'Sometimes one of them is the main verb all by itself.'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'This summer, my older brother [has] a job at the city pool.', labels: { has: 'main verb', job: 'thing, not a verb' }, text: ['Has is one of the 23 helpers. Is it helping here?', 'Look right after has: a job. A job is a thing, not a verb.', 'No verb comes after has, so has is the main verb all by itself.'] },
      { t: 'guided', coach: 'Find has. Then look right after it. Is there another verb for it to help?', q: { mode: 'verb', s: 'She [has] a red bike.', h: 'Is there another verb after has?', h2: 'Red describes the bike, and bike is a thing. If nothing after has is a verb, has works alone.', ex: 'Has is the only verb. It is the main verb here.', notes: { red: 'Red describes the bike.', bike: 'Bike is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: 'By noon, the bakers [had] [mixed] enough dough for two hundred rolls.', ask: 'What had the bakers done?', h: 'Had is a HAVE word. Is there another verb right after it?', h2: 'When a verb comes right after had, had is helping. Rolls is a thing here (bread), not an action.', ex: 'Had helps mixed. The verb team is: had mixed.', notes: { rolls: 'Here rolls are bread (things), so it is a noun, not a verb.', dough: 'Dough is a thing (a noun).', enough: 'Enough tells how much dough. It is not a verb.' } } }
    ] },
    { id: 'D', title: 'Find the Whole Verb Team', skill: 'team', key: 'A helping verb works with a main verb. Find every verb word in the team.', steps: [
      { t: 'explain', title: 'Verb teams', text: ['A helping verb works with a main verb.', 'Together, they make a verb team.', 'Find EVERY verb word in the team.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'The boy [was] [playing] yesterday.', labels: { was: 'helper', playing: 'main verb' }, text: ['was = helper', 'playing = main verb', 'was playing = the whole verb team'] },
      { t: 'explain', title: 'Coach tip: ask a question', text: ['Ask: What was the boy doing?', 'Answer: was playing.', 'Do not stop too soon. Do not add extra words.'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'During the field trip, our teacher [was] [taking] pictures of the colorful fish.', labels: { was: 'helper', taking: 'main verb', pictures: 'thing' }, text: ['Ask: What was our teacher doing? Answer: was taking.', 'Was is the helper. Taking is the main verb. Tap both.', 'Trip, pictures, and fish are nouns. Do not add them to the team.'] },
      { t: 'guided', coach: 'What are we doing? Tap EVERY word in the verb team.', q: { mode: 'verb', s: 'We [are] [reading].', ask: 'What are we doing?', h: 'Are is a helper. Which verb does it help?', h2: 'A helper never works alone in a team. Tap the helper, then the action word that comes right after it.', ex: 'Are helps reading. The verb team is: are reading.' } },
      { t: 'try', q: { mode: 'verb', s: 'She [has] [finished].', ask: 'What has she done?', h: 'Has can help another verb.', h2: 'Here a verb comes right after has, so has is helping. The team has two words.', ex: 'Has helps finished. The verb team is: has finished.' } },
      { t: 'try', q: { mode: 'verb', s: 'He [can] [swim].', ask: 'What can he do?', h: 'Can is a helper. What can he do?', h2: 'Can is one of the 23 helpers. Answer the question "What can he do?" with every verb word.', ex: 'Can helps swim. The verb team is: can swim.' } },
      { t: 'try', q: { mode: 'verb', s: 'They [will] [practice].', ask: 'What will they do?', h: 'Will is a helper. What will they do?', h2: 'Will tells about later, but it cannot do the job alone. Find the action it helps.', ex: 'Will helps practice. The verb team is: will practice.' } },
      { t: 'try', q: { mode: 'verb', s: 'Our neighbor’s cat [has] [climbed] onto the roof of the garage again.', ask: 'What has the cat done?', h: 'Ask: What has the cat done? Find every word in that answer.', h2: 'Find the helper first. Then keep going to the action word right after it. Roof and garage are places, not verbs.', ex: 'Has is the helper and climbed is the main verb. The verb team is: has climbed.', notes: { roof: 'Roof is a place (a noun).', garage: 'Garage is a place (a noun).', again: 'Again tells when. It is not a verb.' } } }
    ] },
    { id: 'E', title: 'Longer Verb Teams', skill: 'long', optional: true, key: 'A verb team can have more than two verb words.', steps: [
      { t: 'explain', title: 'Bigger teams', text: ['A verb team can have more than two verb words.', 'Look for helpers in a row. Keep going until you reach the main verb.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'He [has] [been] [practicing].', labels: { has: 'helper', been: 'helper', practicing: 'main verb' }, text: ['has = helper, been = helper', 'practicing = main verb', 'The team: has been practicing'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'All afternoon, the twins [have] [been] [building] a sandcastle near the waves.', labels: { have: 'helper', been: 'helper', building: 'main verb', waves: 'thing, not a verb' }, text: ['Find the first helper: have. Keep going: been is a helper too.', 'Stop at the main verb: building. The team is have been building.', 'Waves can be a verb, but here it names the water, a thing.'] },
      { t: 'guided', coach: 'This team has THREE verb words. Tap all three.', q: { mode: 'verb', s: 'We [will] [be] [reading].', ask: 'What will we be doing?', h: 'Will and be are helpers. What will we be doing?', h2: 'Start at will and keep tapping until you reach the -ing word. Every word on the way is part of the team.', ex: 'Will and be help reading. The team is: will be reading.' } },
      { t: 'try', q: { mode: 'verb', s: 'She [had] [been] [waiting] for the bus.', ask: 'What had she been doing?', h: 'Start at had. Keep going until the main verb.', h2: 'Had and been are both on the list of 23 helpers. The team ends at the action word after them.', ex: 'Had and been help waiting. The team is: had been waiting.', notes: { bus: 'Bus is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: 'Before dinner, Tasha [had] [been] [playing] her new piano song for an hour.', ask: 'What had Tasha been doing?', h: 'Find the first helper after Tasha. Keep going until you reach the main verb.', h2: 'Two helpers sit in a row before the action. Piano and song name things, so the team stops before them.', ex: 'Had and been are helpers. Playing is the main verb. The team is: had been playing.', notes: { song: 'Song is a thing (a noun).', piano: 'Piano tells what kind of song. It is not a verb.', new: 'New describes the song. It is not a verb.', hour: 'Hour is a time (a noun).' } } }
    ] },
    { id: 'F', title: 'Ending Clues', skill: 'endings', key: '-ed and -ing are clues, but read the sentence to be sure.', steps: [
      { t: 'explain', title: 'Word endings', text: ['-ed and -ing are word endings.', 'They can help us notice verbs.', 'But we must read the whole sentence to be sure.'] },
      { t: 'table', title: 'Watch the endings', head: ['Now', 'Past (-ed)', 'With -ing'], rows: [['play', 'played', 'playing'], ['jump', 'jumped', 'jumping'], ['help', 'helped', 'helping']] },
      { t: 'table', title: 'Some verbs change instead', head: ['Now', 'Past'], rows: [['run', 'ran'], ['eat', 'ate'], ['catch', 'caught'], ['write', 'wrote']], text: ['These verbs do not use -ed. They change to a new word.'] },
      { t: 'compare', title: 'Not every -ing word is a verb', items: [ { mode: 'verb', s: 'The boy [is] [running].', line: 'Running tells what the boy is doing. Verb team: is running' }, { mode: 'verb', s: 'The running shoes [are] red.', labels: { running: 'describes shoes' }, line: 'Running describes the shoes. The verb is: are' } ] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'The giggling toddlers [splashed] in the shallow end of the pool.', labels: { giggling: 'describes the toddlers', splashed: 'verb' }, text: ['Two words have endings: giggling and splashed.', 'Giggling tells what kind of toddlers. No helper comes before it, so it is not a verb here.', 'Splashed tells what the toddlers did. It is the verb.'] },
      { t: 'guided', coach: 'Running has -ing. Ask: is it something the shoes are doing, or does it tell what kind of shoes?', q: { mode: 'verb', s: 'The running shoes [are] red.', h: 'Careful! Does running describe the shoes here?', h2: 'An -ing word is a verb only when a helper like is or are comes right before it. Here running sits in front of shoes, so look for the BE word.', ex: 'Are is the verb. Running describes the shoes.', notes: { running: 'Here running describes the shoes. It is not a verb in this sentence.', red: 'Red describes the shoes.' } } },
      { t: 'try', q: { mode: 'verb', s: 'Jada [jumped] over the rope.', ask: 'What did Jada do?', h: 'Look for the -ed clue. Does it show what Jada did?', h2: 'Rope is a thing. The word with an ending tells what Jada did in the past.', ex: 'Jumped tells what Jada did.', notes: { rope: 'Rope is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: 'After lunch, the excited campers [were] [paddling] canoes across the lake.', ask: 'What were the campers doing?', h: 'Two words have endings. Which one describes the campers, and which one tells what they were doing?', h2: 'Excited sits in front of campers and tells how they feel. An -ing word with a helper right before it is a verb team.', ex: 'Were is the helper and paddling is the main verb: were paddling. Excited describes the campers.', notes: { excited: 'Excited describes the campers. The -ed ending does not make it a verb here.', canoes: 'Canoes are things (nouns).', lunch: 'Lunch is a thing (a meal).', across: 'Across starts the words that tell where. It is not a verb.' } } }
    ] },
    { id: 'G', title: 'Challenge: Words in Between', skill: 'challenge', optional: true, key: 'Other words can sit between verb words. Leave them out.', steps: [
      { t: 'explain', title: 'Sneaky words', text: ['Sometimes other words sit between verb words.', 'Words like not and easily are NOT verbs.', 'Skip them, but still find every verb word.'] },
      { t: 'show', title: 'Watch me find it', mode: 'verb', s: 'The boy [is] not [sleeping].', labels: { is: 'helper', sleeping: 'main verb', not: 'not a verb' }, text: ['Verb words: is, sleeping', 'Not is not a verb. Leave it out.'] },
      { t: 'show', title: 'Another one', mode: 'verb', s: 'She [can] easily [catch] the ball.', labels: { can: 'helper', catch: 'main verb', easily: 'tells how' }, text: ['Verb words: can, catch', 'Easily tells how. It is not a verb.'] },
      { t: 'show', title: 'A longer sentence', mode: 'verb', s: 'Our class [has] nearly [collected] two hundred cans for the food drive.', labels: { has: 'helper', nearly: 'not a verb', collected: 'main verb', drive: 'thing, not a verb' }, text: ['Find the helper: has. Then keep looking for the main verb: collected.', 'Nearly sits in between. It tells how close, so skip it.', 'Drive can be a verb, but here the food drive is an event, a thing.'] },
      { t: 'guided', coach: 'Find the helper and the main verb. Skip the word in between.', q: { mode: 'verb', s: 'We [will] soon [eat] dinner.', ask: 'What will we do?', h: 'Soon tells when. Skip it.', h2: 'The helper comes first. Jump over the word that tells when, and tap the action word after it.', ex: 'Will and eat are the verb words. Soon is not a verb.', notes: { soon: 'Soon tells WHEN. It is not a verb.', dinner: 'Dinner is a thing.' } } },
      { t: 'try', q: { mode: 'verb', s: '[Can] you [hit] the ball?', ask: 'What can you do?', h: 'In a question, the helper can come first.', h2: 'Turn the question into a telling sentence: You ___ ___ the ball. The same two verb words are in the question.', ex: 'Can and hit are the verb words. In a question, the helper moves to the front.', notes: { you: 'You is a pronoun. It is not a verb.' } } },
      { t: 'try', q: { mode: 'verb', s: '[Will] your grandmother [bring] her famous sweet potato pie to the picnic?', ask: 'What will your grandmother do?', h: 'In a question, the helper can jump to the front. Where is the main verb?', h2: 'Say it as a telling sentence: Your grandmother ___ ___ her pie. The helper moved to the front, and the main verb is still after grandmother.', ex: 'Will and bring are the verb words. In a question, the helper moves to the front.', notes: { grandmother: 'Grandmother is a person (a noun). She sits between the verb words.', famous: 'Famous describes the pie. It is not a verb.', picnic: 'Picnic is a thing (an event).', pie: 'Pie is a thing (a noun).' } } }
    ] }
  ],

  nouns: [
    { id: 'A', title: 'People Nouns', skill: 'people', key: 'A noun can name a person.', steps: [
      { t: 'explain', title: 'Nouns name things', text: ['A noun names a person, place, thing, or idea.', 'Today we start with people.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'The [coach:p] smiled.', labels: { coach: 'person' }, text: ['Coach names a person.', 'We draw ONE line under a noun.'] },
      { t: 'words', title: 'People nouns', groups: [ { name: 'People', words: ['mom', 'teacher', 'coach', 'friend', 'baby', 'pilot'] } ] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: 'At the [library:l], my [neighbor:p] helped a little [boy:p] find his [mittens:t].', labels: { neighbor: 'person', boy: 'person', library: 'place', mittens: 'thing' }, text: ['A longer sentence can have many nouns. Ask: Who is in this sentence?', 'Neighbor and boy name people.', 'Library and mittens are nouns too, but they name a place and a thing.'] },
      { t: 'guided', coach: 'Who waved? Tap the noun that names a person.', q: { mode: 'noun', s: 'My [friend:p] waved.', h: 'Who did the waving?', h2: 'Waved is the action. The person noun is the word that tells who did it.', ex: 'Friend names a person.' } },
      { t: 'try', q: { mode: 'noun', s: 'The [doctor:p] helped me.', h: 'Who helped?', h2: 'Me stands in for a name, so we skip it. Look for the word that names someone’s job.', ex: 'Doctor names a person.', notes: { me: 'Me is a pronoun. It stands in for a noun, so we do not tap it here.' } } },
      { t: 'try', q: { mode: 'noun', want: 'p', s: 'Before the [race:t], the [nurse:p] gave my [cousin:p] a [bottle:t] of [water:t].', h: 'Ask: Who is in this sentence? There are two people.', h2: 'A person noun can name a job or a family member. Race, bottle, and water are nouns too, but you can not talk to them.', ex: 'Nurse and cousin name people. Race, bottle, and water are things.', notes: { my: 'My tells whose cousin. It is not a noun.' } } }
    ] },
    { id: 'B', title: 'Place Nouns', skill: 'places', key: 'A noun can name a place.', steps: [
      { t: 'explain', title: 'Places', text: ['A noun can name a place.', 'Ask: Where?'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'We went to the [park:l].', labels: { park: 'place' }, text: ['Park names a place.'] },
      { t: 'words', title: 'Place nouns', groups: [ { name: 'Places', words: ['park', 'school', 'kitchen', 'field', 'store', 'beach'] } ] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: '[Kiara:pP] walked from her [house:l] to a [pool:l] beside the [river:l].', labels: { kiara: 'person', house: 'place', pool: 'place', river: 'place' }, text: ['Ask: Where did Kiara go? Keep reading to the end.', 'House, pool, and river all name places.', 'Kiara is a noun too, but she is a person.'] },
      { t: 'guided', coach: 'Where did the kids run? Tap the PLACE noun only.', q: { mode: 'noun', want: 'l', s: 'The [kids:p] ran to the [park:l].', h: 'Ask: Where did they run?', h2: 'Kids tells who ran. A place noun names somewhere you can go.', ex: 'Park names a place. Kids is a noun too, but it names people.' } },
      { t: 'try', q: { mode: 'noun', want: 'l', s: '[Grandma:p] lives on a [farm:l].', h: 'Where does Grandma live?', h2: 'Grandma is the person. Look after the words lives on for where she lives.', ex: 'Farm names a place.' } },
      { t: 'try', q: { mode: 'noun', want: 'l', s: 'The [campers:p] hiked through a [forest:l] and rested in a quiet [valley:l].', h: 'Ask: Where did the campers hike? Where did they rest? There are two places.', h2: 'Words like through and in often come right before a place. Campers are people, so skip them.', ex: 'Forest and valley name places. Campers are people.', notes: { quiet: 'Quiet describes the valley. It is an adjective.' } } }
    ] },
    { id: 'C', title: 'Thing Nouns', skill: 'things', key: 'A noun can name a thing. Animals count too!', steps: [
      { t: 'explain', title: 'Things', text: ['A noun can name a thing.', 'Animals are living things, so they are nouns too.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'I found a [ball:t].', labels: { ball: 'thing' }, text: ['Ball names a thing.'] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: '[Darius:pP] packed a [sandwich:t], an [apple:t], and two [cookies:t] in his [lunchbox:t].', labels: { darius: 'person', sandwich: 'thing', apple: 'thing', cookies: 'thing', lunchbox: 'thing' }, text: ['Ask: What did Darius pack? Where did he put it?', 'Sandwich, apple, cookies, and lunchbox all name things.', 'Darius is a noun too, but he is a person.'] },
      { t: 'guided', coach: 'Find BOTH nouns: the animal and the thing.', q: { mode: 'noun', s: 'The [dog:t] chewed a [bone:t].', h: 'Who chewed? What did it chew?', h2: 'Chewed is the action. One noun comes before it and one comes after it.', ex: 'Dog names an animal. Bone names a thing.' } },
      { t: 'try', q: { mode: 'noun', want: 't', s: '[Dad:p] fixed the [car:t].', h: 'What did Dad fix?', h2: 'Dad is a person. Look after fixed for the thing he worked on.', ex: 'Car names a thing. Dad is a person.' } },
      { t: 'try', q: { mode: 'noun', want: 't', s: 'My [sister:p] found a [feather:t] and a smooth [rock:t] near the [lake:l].', h: 'Ask: What did my sister find? Look for two things.', h2: 'Sister is a person and lake is a place. Thing nouns are what she could pick up and hold.', ex: 'Feather and rock name things. Sister is a person and lake is a place.', notes: { smooth: 'Smooth describes the rock. It is an adjective.', my: 'My tells whose sister. It is not a noun.' } } }
    ] },
    { id: 'D', title: 'Common & Proper Nouns', skill: 'proper', key: 'A proper noun is a special name. It starts with a capital letter.', steps: [
      { t: 'explain', title: 'Common or proper?', text: ['A common noun names any person, place, or thing: boy, city, dog.', 'A proper noun is a special name: Marcus, Atlanta, Rex.', 'Proper nouns start with a capital letter.'] },
      { t: 'table', title: 'Common and proper', head: ['Common noun', 'Proper noun'], rows: [['boy', 'Marcus'], ['city', 'Atlanta'], ['dog', 'Rex'], ['holiday', 'Thanksgiving']] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: '[Malia:pP] and her [dad:p] visited a [zoo:l] in [Atlanta:lP] with their [dog:t] [Biscuit:tP].', labels: { malia: 'proper', dad: 'common', zoo: 'common', atlanta: 'proper', dog: 'common', biscuit: 'proper' }, text: ['Every noun is marked. Now sort them: special name or not?', 'Malia, Atlanta, and Biscuit are special names, so they are proper nouns.', 'Dad, zoo, and dog could be any dad, zoo, or dog. They are common nouns.'] },
      { t: 'guided', coach: 'What is the dog’s special name? Tap the PROPER noun.', q: { mode: 'noun', want: 'P', s: 'My [dog:t] [Rex:tP] can run fast.', h: 'Look for the capital letter in the middle of the sentence.', h2: 'Dog could be any dog. A proper noun is the name of just one dog.', ex: 'Rex is a special name, so it is a proper noun. Dog is a common noun.' } },
      { t: 'try', q: { mode: 'noun', want: 'P', s: '[Maya:pP] lives in [Georgia:lP].', h: 'There are two special names.', h2: 'One special name is a girl, and one is a state. Both start with capital letters.', ex: 'Maya and Georgia are proper nouns.' } },
      { t: 'try', q: { mode: 'noun', want: 'P', s: 'On our [trip:t] to [Athens:lP], my [cousin:p] [Kwame:pP] fed the [ducks:t] at a [pond:l].', h: 'Look for special names. They start with capital letters, even in the middle of a sentence.', h2: 'A proper noun names one special person or place. Trip, cousin, ducks, and pond are general words, so skip them.', ex: 'Athens is the name of a city in Georgia, and Kwame is a boy’s name. They are proper nouns.', notes: { our: 'Our tells whose trip. It is not a noun.', my: 'My tells whose cousin. It is not a noun.' } } }
    ] },
    { id: 'E', title: 'More Than One Noun', skill: 'multi', key: 'A sentence can have many nouns. Find them all!', steps: [
      { t: 'explain', title: 'Find them all', text: ['A sentence can have more than one noun.', 'Check every word. Ask: person? place? thing?'] },
      { t: 'show', title: 'Watch me find them', mode: 'noun', s: '[Chris:p] carries a [bat:t].', labels: { chris: 'person', bat: 'thing' }, text: ['Chris names a person.', 'Bat names a thing.'] },
      { t: 'show', img: 'nouns', title: 'Another one', mode: 'noun', s: 'The [coach:p] stood on the [field:l].', labels: { coach: 'person', field: 'place' }, text: ['Coach names a person.', 'Field names a place.'] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: 'During [recess:t], [Andre:pP] and his [friends:p] built a [fort:t] under the [slide:t].', labels: { recess: 'thing', andre: 'person', friends: 'person', fort: 'thing', slide: 'thing' }, text: ['Go word by word. Ask: person? place? thing?', 'Andre and friends are people. Fort and slide are things.', 'Recess is a time of the school day, so it counts as a thing too.'] },
      { t: 'guided', coach: 'Find ALL THREE nouns.', q: { mode: 'noun', s: 'My [sister:p] found a [shell:t] at the [beach:l].', h: 'A person, a thing, and a place.', h2: 'Ask three questions: Who found it? What did she find? Where was it?', ex: 'Sister is a person. Shell is a thing. Beach is a place.' } },
      { t: 'try', q: { mode: 'noun', s: '[Grandma:p] baked a [pie:t] in the [kitchen:l].', h: 'Who? What? Where?', h2: 'Baked is the action. Find who did it, what she made, and the room where she made it.', ex: 'Grandma is a person. Pie is a thing. Kitchen is a place.' } },
      { t: 'try', q: { mode: 'noun', s: 'My [grandpa:p] read a [story:t] to my little [sister:p] on the [porch:l] after [dinner:t].', h: 'There are five nouns. Ask: Who? What? Where? When?', h2: 'Check the word after each a, the, and my. Little describes sister, and after tells when, so skip those words.', ex: 'Grandpa and sister are people. Story and dinner are things. Porch is a place.', notes: { little: 'Little describes sister. It is an adjective.', my: 'My tells whose. It is not a noun.', after: 'After tells when. The noun is the word right after it.' } } }
    ] },
    { id: 'F', title: 'Idea Nouns', skill: 'ideas', key: 'Some nouns name ideas or feelings you cannot touch.', steps: [
      { t: 'explain', title: 'Ideas are nouns too', text: ['Some nouns name ideas or feelings.', 'You cannot touch them, but they are still nouns.', 'Examples: kindness, joy, courage, friendship.'] },
      { t: 'show', title: 'Watch me find it', mode: 'noun', s: 'Her [kindness:i] made me happy.', labels: { kindness: 'idea' }, text: ['Kindness names an idea.'] },
      { t: 'show', title: 'A longer sentence', mode: 'noun', s: '[Kofi:pP] showed great [courage:i] when he sang a [song:t] for the [audience:p].', labels: { kofi: 'person', courage: 'idea', song: 'thing', audience: 'people' }, text: ['Ask: Which noun can you NOT see or touch?', 'Courage is being brave. It names an idea.', 'Kofi and the audience are people. Song is a thing.'] },
      { t: 'guided', coach: 'Find the noun that names a feeling. You cannot see it or hold it.', q: { mode: 'noun', want: 'i', s: 'The [puppy:t] filled our [home:l] with [happiness:i].', h: 'Which noun names a feeling?', h2: 'Puppy and home are nouns you can see. Ask: What did the puppy bring into the home?', ex: 'Happiness names a feeling, which is an idea. Puppy is a thing and home is a place.' } },
      { t: 'try', q: { mode: 'noun', want: 'i', s: 'We felt [joy:i] at the [game:t].', h: 'Which noun names a feeling?', h2: 'A game is an event you can watch. Find the noun that tells how we felt.', ex: 'Joy names a feeling, which is an idea. Game is a noun too, but it is an event (a thing).' } },
      { t: 'try', q: { mode: 'noun', want: 'i', s: 'Our [coach:p] praised the [team:p] for their [teamwork:i] at the [tournament:t].', h: 'What did the coach praise the team for? You cannot hold it.', h2: 'Coach and team are people, and a tournament is an event. An idea noun names a way of acting together that you cannot touch.', ex: 'Teamwork names an idea. Coach and team are people, and tournament is a thing (an event).', notes: { our: 'Our tells whose coach. It is not a noun.', their: 'Their tells whose teamwork. It is not a noun.' } } }
    ] }
  ],

  adjectives: [
    { id: 'A', title: 'What Kind?', skill: 'kind', key: 'An adjective describes a noun.', steps: [
      { t: 'explain', title: 'Adjectives', text: ['An adjective describes a noun.', 'It can tell what kind, which one, or how many.', 'Little words like the, a, and my will be gray. You do not tap them here.'] },
      { t: 'show', img: 'adjectives', title: 'Watch me find it', mode: 'adj', s: 'The [red@ball] ball rolled.', text: ['Red describes ball.', 'It tells what kind of ball.'] },
      { t: 'show', title: 'Another one', mode: 'adj', s: 'The [small@puppy] puppy sleeps.', text: ['Small describes puppy.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adj', s: 'After lunch, Imani read a [funny@story] story to her [sleepy@cousins] cousins.', text: ['First find the nouns: lunch, Imani, story, cousins.', 'Ask: what kind? Funny tells what kind of story.', 'Sleepy tells what kind of cousins. Lunch and Imani have no describing word.'] },
      { t: 'guided', coach: 'First find the noun. Then find the word that describes it.', q: { mode: 'adj', s: 'The [brown@dog] dog barked.', h: 'What kind of dog?', h2: 'Dog is the noun and barked is the action. The adjective sits right before the noun and tells its color.', ex: 'Brown describes dog.' } },
      { t: 'try', q: { mode: 'adj', s: 'We ate [warm@bread] bread.', h: 'What kind of bread?', h2: 'Find the noun bread. Then look for the word that tells how the bread feels.', ex: 'Warm describes bread.' } },
      { t: 'try', q: { mode: 'adj', s: 'Under the bridge, a [noisy@duck] duck splashed in the [cold@water] water.', h: 'Find each noun. Then ask: what kind?', h2: 'There are two nouns with describing words: duck and water. Ask "what kind of duck?" and "what kind of water?"', ex: 'Noisy describes duck. Cold describes water. Both tell what kind.' } }
    ] },
    { id: 'B', title: 'How Many?', skill: 'many', key: 'Number words can be adjectives. They tell how many.', steps: [
      { t: 'explain', title: 'How many?', text: ['Some adjectives tell how many.', 'Number words like two and five can describe a noun.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adj', s: '[Three@players] players ran.', text: ['Three tells how many players.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adj', s: 'At the pond, [four@parents] parents helped our class count [ten@turtles] turtles.', text: ['Find the nouns: pond, parents, class, turtles.', 'Ask: how many parents? Four. How many turtles? Ten.', 'Our tells whose class, so it stays gray.'] },
      { t: 'guided', coach: 'Find the noun. Then ask: how many?', q: { mode: 'adj', s: '[Five@birds] birds sat on the fence.', h: 'How many birds?', h2: 'Look for a number word. A number right before a noun tells how many.', ex: 'Five describes birds.' } },
      { t: 'try', q: { mode: 'adj', s: 'I have [two@cookies] cookies.', h: 'How many cookies?', h2: 'Find the noun cookies. The word right before it counts them.', ex: 'Two describes cookies.' } },
      { t: 'try', q: { mode: 'adj', s: 'After the game, [six@kids] kids shared [two@pizzas] pizzas on the porch.', h: 'Find each noun. Ask: how many?', h2: 'Look for number words. Each one sits right before the noun it counts.', ex: 'Six describes kids. Two describes pizzas. Both tell how many.' } }
    ] },
    { id: 'C', title: 'Which One?', skill: 'which', key: 'Some adjectives tell which one.', steps: [
      { t: 'explain', title: 'Which one?', text: ['Some adjectives tell which one.', 'Words like first, last, and next can do this.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adj', s: 'The [last@player] player ran home.', text: ['Last tells which player.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adj', s: 'Kenji sat in the [first@row] row and waited for the [second@bell] bell.', text: ['Find the nouns: Kenji, row, bell.', 'Ask: which row? The first one. Which bell? The second one.', 'First and second are order words. They tell which one.'] },
      { t: 'guided', coach: 'Find the noun grape. Then ask: which grape?', q: { mode: 'adj', s: 'I ate the [last@grape] grape.', h: 'Which grape did I eat?', h2: 'Order words like first, next, and last tell which one. Look between the and grape.', ex: 'Last describes grape. It tells which one.' } },
      { t: 'try', q: { mode: 'adj', s: 'We will win the [next@game] game.', h: 'Which game?', h2: 'Find the noun game. The word before it tells which game, not what kind.', ex: 'Next describes game. It tells which one.' } },
      { t: 'try', q: { mode: 'adj', s: 'On the [first@morning] morning of camp, Jada swam across the lake.', h: 'Find the nouns. Which one has a word that tells which one?', h2: 'Look for an order word like first, second, next, or last. Then check which noun comes right after it.', ex: 'First describes morning. It tells which morning.' } }
    ] },
    { id: 'D', title: 'Find the Noun First', skill: 'link', key: 'Find the noun. Ask what describes it. Tap the adjective.', steps: [
      { t: 'explain', title: 'Four steps', text: ['1. Find the noun.', '2. Ask: what kind? which one? how many?', '3. Tap the describing word.', '4. Draw an arrow to the noun it describes.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adj', s: 'In the morning, the [new@puppy] puppy sniffed its [soft@bed] bed in the [cozy@kitchen] kitchen.', text: ['Step 1: find the nouns: morning, puppy, bed, kitchen.', 'Step 2: ask what describes each one. New tells what kind of puppy. Soft tells what kind of bed. Cozy tells what kind of kitchen.', 'Morning has no describing word. Each arrow points to the noun the adjective describes.'] },
      { t: 'guided', coach: 'Step 1: find the noun.', q: { mode: 'adj', s: 'The [loud@crowd] crowd cheered.', h: 'What kind of crowd?', h2: 'Crowd is the noun. Cheered is the action. The adjective tells what the crowd sounded like.', ex: 'Loud describes crowd.' } },
      { t: 'try', q: { mode: 'adj', s: 'The [muddy@shoes] shoes are by the door.', h: 'What kind of shoes?', h2: 'Find the noun shoes first. Then look for the word that tells how they look.', ex: 'Muddy describes shoes.' } },
      { t: 'try', q: { mode: 'adj', s: 'On the [snowy@hill] hill, the kids rode [wooden@sleds] sleds after school.', h: 'Find the nouns hill, kids, sleds, and school. Which ones have a describing word?', h2: 'Look right before each noun. Ask: what kind of hill? What kind of sleds?', ex: 'Snowy describes hill. Wooden describes sleds. Kids and school have no describing word.' } }
    ] },
    { id: 'E', title: 'More Than One Adjective', skill: 'multi', key: 'A sentence can have more than one adjective.', steps: [
      { t: 'explain', title: 'Look for more', text: ['A sentence can have more than one adjective.', 'Check every noun.'] },
      { t: 'show', title: 'Watch me find them', mode: 'adj', s: 'The [little@kitten] kitten has [green@eyes] eyes.', text: ['Little describes kitten.', 'Green describes eyes.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adj', s: 'A [hungry@seagull] seagull grabbed [three@fries] fries from the [busy@boardwalk] boardwalk.', text: ['Check every noun: seagull, fries, boardwalk.', 'Hungry and busy tell what kind. Three tells how many.', 'Each noun here has its own adjective, so there are three to find.'] },
      { t: 'guided', coach: 'There are two nouns. Find an adjective for each one.', q: { mode: 'adj', s: 'The [tall@girl] girl kicked a [red@ball] ball.', h: 'Check both nouns: girl and ball.', h2: 'Ask "what kind of girl?" Then ask "what kind of ball?" Each noun has one describing word.', ex: 'Tall describes girl. Red describes ball.' } },
      { t: 'try', q: { mode: 'adj', s: 'The [old@tree] tree has [many@leaves] leaves.', h: 'What kind of tree? How many leaves?', h2: 'Find both nouns: tree and leaves. One adjective tells what kind and one tells how many.', ex: 'Old describes tree. Many describes leaves.' } },
      { t: 'try', q: { mode: 'adj', s: '[Two@squirrels] squirrels raced up a [huge@tree] tree in the [quiet@park] park.', h: 'Check every noun: squirrels, tree, and park.', h2: 'Each noun has one describing word right before it. One tells how many, and two tell what kind.', ex: 'Two describes squirrels (how many). Huge describes tree. Quiet describes park.' } }
    ] }
  ],

  adverbs: [
    { id: 'A', title: 'How?', skill: 'how', key: 'An adverb can tell HOW something happens.', steps: [
      { t: 'explain', title: 'Adverbs', text: ['An adverb can describe a verb.', 'It can tell how, when, or where.', 'Today: HOW.'] },
      { t: 'show', img: 'adverbs', title: 'Watch me find it', mode: 'adv', s: 'Chris runs [quickly@runs:how].', text: ['Quickly tells HOW Chris runs.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adv', s: 'At the talent show, Deja sang her favorite song [loudly@sang:how].', labels: { favorite: 'describes song' }, text: ['Find the verb first: sang.', 'Ask: HOW did Deja sing? Loudly. That is the adverb.', 'Favorite describes the song, a noun. It is not an adverb.'] },
      { t: 'guided', coach: 'Find the verb moved. Then ask: HOW did the turtle move?', q: { mode: 'adv', s: 'The turtle moved [slowly@moved:how].', h: 'How did the turtle move?', h2: 'Moved is the action. The adverb tells what the moving was like: fast or slow?', ex: 'Slowly tells HOW the turtle moved.' } },
      { t: 'try', q: { mode: 'adv', s: 'The team played [well@played:how].', h: 'How did the team play?', h2: 'Find the verb played. The adverb tells how good the playing was. It does not end in -ly.', ex: 'Well tells HOW they played. Not every adverb ends in -ly!' } },
      { t: 'try', q: { mode: 'adv', s: 'Our dog waited [patiently@waited:how] by the front door for his dinner.', h: 'Find the verb waited. How did the dog wait?', h2: 'Front describes the door, a noun, so skip it. Look for the word that tells what the waiting was like.', ex: 'Patiently tells HOW the dog waited.', notes: { front: 'Front describes the door, a noun. It is an adjective.' } } }
    ] },
    { id: 'B', title: 'When?', skill: 'when', key: 'An adverb can tell WHEN something happens.', steps: [
      { t: 'explain', title: 'When?', text: ['Some adverbs tell WHEN.', 'Examples: yesterday, today, soon, later.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adv', s: 'We practiced [yesterday@practiced:when].', text: ['Yesterday tells WHEN we practiced.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adv', s: 'Mia will bring her new puppy to Grandma’s house [tomorrow@bring:when].', labels: { new: 'describes puppy' }, text: ['Find the verb: will bring.', 'Ask: WHEN will Mia bring the puppy? Tomorrow. That is the adverb.', 'New describes the puppy, a noun. It is not an adverb.'] },
      { t: 'guided', coach: 'Find the verb ate. Then ask: WHEN did we eat pancakes?', q: { mode: 'adv', s: 'We ate pancakes [today@ate:when].', h: 'When did we eat pancakes?', h2: 'Pancakes is a thing. Look for a time word, like the ones in the examples.', ex: 'Today tells WHEN we ate pancakes.' } },
      { t: 'try', q: { mode: 'adv', s: 'The bus will come [soon@come:when].', h: 'When will the bus come?', h2: 'Find the verb will come. The adverb tells if it happens now or later.', ex: 'Soon tells WHEN.' } },
      { t: 'try', q: { mode: 'adv', s: 'Grandpa will fix the squeaky swing in our backyard [later@fix:when].', h: 'Find the verb will fix. When will Grandpa fix the swing?', h2: 'Squeaky describes the swing, a noun, so skip it. Look for the word that tells the time Grandpa will do it.', ex: 'Later tells WHEN Grandpa will fix the swing.', notes: { squeaky: 'Squeaky describes the swing, a noun. It is an adjective.' } } }
    ] },
    { id: 'C', title: 'Where?', skill: 'where', key: 'An adverb can tell WHERE something happens.', steps: [
      { t: 'explain', title: 'Where?', text: ['Some adverbs tell WHERE.', 'Examples: outside, here, upstairs, away.'] },
      { t: 'show', title: 'Watch me find it', mode: 'adv', s: 'The children played [outside@played:where].', text: ['Outside tells WHERE the children played.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adv', s: 'After the party, Dad carried my sleepy little sister [upstairs@carried:where].', labels: { sleepy: 'describes sister', little: 'describes sister' }, text: ['Find the verb: carried.', 'Ask: WHERE did Dad carry her? Upstairs. That is the adverb.', 'Sleepy and little describe my sister, a noun. They are adjectives.'] },
      { t: 'guided', coach: 'Find the verb flew. Then ask: WHERE did the bird fly?', q: { mode: 'adv', s: 'The bird flew [away@flew:where].', h: 'Where did the bird fly?', h2: 'Flew is the action. Look for the word that tells which way the bird went.', ex: 'Away tells WHERE the bird flew.' } },
      { t: 'try', q: { mode: 'adv', s: 'The cat ran [upstairs@ran:where].', h: 'Where did the cat run?', h2: 'Find the verb ran. The adverb names the part of the house the cat went to.', ex: 'Upstairs tells WHERE.' } },
      { t: 'try', q: { mode: 'adv', s: 'On sunny days, our class eats lunch [outdoors@eats:where] at the picnic tables.', h: 'Find the verb eats. Where does our class eat lunch?', h2: 'Sunny describes the days, a noun, so skip it. Look for one word right after lunch that tells where.', ex: 'Outdoors tells WHERE our class eats lunch.', notes: { sunny: 'Sunny describes the days, a noun. It is an adjective.' } } }
    ] },
    { id: 'D', title: 'Adjective or Adverb?', skill: 'compare', key: 'Ask what the word describes: a noun (adjective) or a verb (adverb).', steps: [
      { t: 'compare', title: 'Careful or carefully?', items: [ { mode: 'adj', s: 'The [careful@player] player throws.', line: 'Careful describes player, a noun. It is an ADJECTIVE.' }, { mode: 'adv', s: 'The player throws [carefully@throws:how].', line: 'Carefully describes throws, a verb. It is an ADVERB.' } ] },
      { t: 'explain', title: 'The -ly clue', text: ['Many adverbs end in -ly, but not all of them do.', 'Fast and well are adverbs with no -ly.', 'Friendly ends in -ly, but in "the friendly dog" it describes a noun.'] },
      { t: 'show', title: 'A longer sentence', mode: 'adv', s: 'The kind nurse spoke [gently@spoke:how] to the frightened little boy.', labels: { kind: 'adjective', frightened: 'adjective', little: 'adjective' }, text: ['Kind, frightened, and little describe nouns: the nurse and the boy. They are adjectives.', 'Gently tells HOW the nurse spoke. It describes a verb, so it is an adverb.', 'For each describing word, ask: does it tell about a noun or a verb?'] },
      { t: 'mc', q: { q: 'The careful player throws.\nWhat does careful describe?', c: ['player — so careful is an adjective', 'throws — so careful is an adverb'], a: 0, h: 'Ask: a careful what?', h2: 'Look at the word right after careful. Is it a person or an action? Words that describe a person, place, or thing are adjectives.', ex: 'Careful describes the player, a noun. So it is an adjective.' } },
      { t: 'try', q: { mode: 'adv', s: 'The quiet girl spoke [quietly@spoke:how].', h: 'Which word tells HOW she spoke?', h2: 'Quiet and quietly look alike. One sits before the noun girl. The other comes after the verb spoke.', ex: 'Quietly tells how she spoke. Quiet describes the girl, so it is an adjective.', notes: { quiet: 'Quiet describes the girl, a noun. That makes it an adjective.' } } },
      { t: 'try', q: { mode: 'adv', s: 'The silly clown juggled [badly@juggled:how] at the birthday party in the park.', h: 'Find the verb juggled. Which word tells HOW the clown juggled?', h2: 'Two words end in -ly. One describes the clown, a noun. The other tells about the action juggled.', ex: 'Badly tells how the clown juggled, so it is an adverb. Silly ends in -ly, but it describes the clown, so it is an adjective.', notes: { silly: 'Silly ends in -ly, but it describes the clown, a noun. That makes it an adjective.' } } }
    ] }
  ],

  vowels: [
    { id: 'A', title: 'Vowel Letters', skill: 'letters', key: 'The vowel letters are a, e, i, o, u.', steps: [
      { t: 'explain', title: 'Meet the vowels', text: ['The vowel letters are a, e, i, o, and u.', 'Every word has at least one vowel sound.'], tiles: ['a', 'e', 'i', 'o', 'u'] },
      { t: 'mc', q: { q: 'Which one is a vowel letter?', c: ['b', 'e', 't'], a: 1, h: 'The vowels are a, e, i, o, u.', h2: 'Say the five vowels out loud: a, e, i, o, u. Then check each choice against that list.', ex: 'E is a vowel letter.' } },
      { t: 'mc', q: { q: 'Which letter in the word cup is a vowel?', c: ['c', 'u', 'p'], a: 1, h: 'Check each letter: c, u, p.', h2: 'Every word has a vowel. Point to each letter in cup and ask: is it a, e, i, o, or u?', ex: 'U is the vowel letter in cup.' } }
    ] },
    { id: 'B', title: 'Short Vowel Sounds', skill: 'short', key: 'One vowel between two consonants often makes a short sound.', steps: [
      { t: 'explain', title: 'Short vowels', text: ['When one vowel sits between two consonants, it often makes a short sound.', 'This is called the CVC pattern, like c-a-t.'] },
      { t: 'words', title: 'Short vowel words', say: true, groups: [ { name: 'short a', words: ['cap', 'cat'] }, { name: 'short e', words: ['bed', 'ten'] }, { name: 'short i', words: ['kit', 'pig'] }, { name: 'short o', words: ['hop', 'pot'] }, { name: 'short u', words: ['cup', 'tub'] } ] },
      { t: 'mc', q: { q: 'Which word has the CVC pattern for a short vowel?', c: ['cape', 'hop', 'rain'], a: 1, say: true, h: 'Find one vowel between two consonants.', h2: 'CVC words have exactly three letters: consonant, vowel, consonant. Count the vowel letters in each word.', ex: 'Hop is h-o-p: one vowel between two consonants.' } }
    ] },
    { id: 'C', title: 'Long Vowel Sounds', skill: 'long', key: 'A long vowel says its own name.', steps: [
      { t: 'explain', title: 'Long vowels', text: ['A long vowel says its own name.', 'Long a as in cake, long i as in kite, long o as in home.', 'Long e as in me, long u as in cute.'] },
      { t: 'mc', q: { q: 'In kite, the i says its name. What kind of vowel sound is that?', c: ['long', 'short'], a: 0, say: true, h: 'When a vowel says its own name, it is...', h2: 'Say kite, then say kit. In kit the i makes a quick sound. In kite it says the letter name. Which kind of vowel says its name?', ex: 'When a vowel says its name, it is a long vowel.' } }
    ] },
    { id: 'D', title: 'Silent e', skill: 'silente', key: 'Silent e often helps the earlier vowel say its name.', steps: [
      { t: 'explain', title: 'The silent e', text: ['Silent e often helps the earlier vowel say its name.', 'You do not hear the e at the end.'] },
      { t: 'table', img: 'vowels', title: 'Add an e and watch', say: true, head: ['Short', 'Add silent e → Long'], rows: [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['cub', 'cube']] },
      { t: 'explain', title: 'Not always!', text: ['Silent e does not ALWAYS work this way.', 'In have and give, the e is silent, but the vowel is short.', 'So use it as a strong clue, not a promise.'] },
      { t: 'mc', q: { q: 'Add silent e to hop. What new word do you make?', c: ['hope', 'hip', 'hops'], a: 0, say: true, h: 'Write hop, then put e at the end.', h2: 'Keep h, o, and p just as they are. The new word has one more letter, and it is an e at the end.', ex: 'hop + e = hope. The o now says its name.' } }
    ] },
    { id: 'E', title: 'Vowel Team: ai', skill: 'teams', key: 'The team ai often says long a.', steps: [
      { t: 'explain', title: 'Vowel team ai', text: ['Sometimes two vowels work as a team.', 'The team ai often says long a.', 'Examples: rain, tail, paint.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ai?', c: ['ran', 'rain', 'run'], a: 1, say: true, h: 'Look for a and i side by side.', h2: 'A team needs two vowel letters touching. Count the vowel letters in each word.', ex: 'Rain has the team ai.' } }
    ] },
    { id: 'F', title: 'Vowel Team: ee', skill: 'teams', key: 'The team ee says long e.', steps: [
      { t: 'explain', title: 'Vowel team ee', text: ['The team ee says long e.', 'Examples: feet, seed, tree.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ee?', c: ['fed', 'feet', 'fit'], a: 1, say: true, h: 'Look for two e letters side by side.', h2: 'Say each word. The team ee says long e, like in see. Check which word has two vowel letters touching.', ex: 'Feet has the team ee.' } }
    ] },
    { id: 'G', title: 'Vowel Team: ea', skill: 'teams', key: 'The team ea often says long e.', steps: [
      { t: 'explain', title: 'Vowel team ea', text: ['The team ea often says long e.', 'Examples: team, seat, beach.', 'Sometimes ea says short e, like in bread. We practice the long e way first.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team ea?', c: ['set', 'seat', 'sit'], a: 1, say: true, h: 'Look for e and a side by side.', h2: 'All three words start with s and end with t. Look at the letters in the middle: one vowel or two?', ex: 'Seat has the team ea.' } }
    ] },
    { id: 'H', title: 'Vowel Team: oa', skill: 'teams', key: 'The team oa says long o.', steps: [
      { t: 'explain', title: 'Vowel team oa', text: ['The team oa says long o.', 'Examples: boat, coat, road.'] },
      { t: 'mc', q: { q: 'Which word has the vowel team oa?', c: ['cot', 'cut', 'coat'], a: 2, say: true, h: 'Look for o and a side by side.', h2: 'The team oa says long o, like in go. Say each word and listen for the o saying its name.', ex: 'Coat has the team oa.' } }
    ] }
  ]
};

/* Hint 2 for older multiple-choice and sort practice items */

var H2 = {
  h1: 'Was and the missing word both tell about the past. Was goes with one person, like he or she. The missing word goes with more than one, like they or we.',
  h2: 'The HAVE family is have, has, and one past word. Think: Yesterday I ___ a cold. Which choice fits that sentence?',
  h3: 'The DO family is do, does, and one past word. Think: Yesterday I ___ my homework. Which choice fits that sentence?',
  h4: 'A helping verb comes before a main verb. Try each choice in this sentence: You ___ eat your lunch. Which one makes sense?',
  h5: 'The helpers are in four families: BE, HAVE, DO, and the OTHER HELPERS. For each choice, ask: is it in a family, or is it something you do with your body?',
  h6: 'The other helpers come in pairs that sound alike: can and could, may and might. The next word means you have to do something, like "You ___ wear a seat belt."',
  h7: 'Shall goes with should, and will has a partner too. Try each choice here: I ___ like a snack. Which one makes sense?',
  h8: 'Try each choice in this sentence: I have ___ to the zoo. Which one makes sense after have?',
  d21: 'Try lonely with each word. Does "a lonely puppy" make sense, or does it tell how the puppy waited? Words that describe a noun are adjectives.',
  d22: 'The -ly ending is only a clue. Look at the word right after lovely. Is it a noun or a verb?',
  d23: 'Ask: hard what? Is hard telling about a thing, or is it telling how the players did their action?',
  o1: 'Say each word slowly. Short a sounds like the a in apple. A silent e or the team ai makes the a say its name instead.',
  o2: 'The silent-e pattern is vowel, then one consonant, then e at the very end, like c-a-k-e. Check the last letter of each word.',
  o3: 'You only add one letter, an e, to the end of kit. Then say the new word. The i should say its name.',
  o4: 'In hop the o is short. Hope is hop with a silent e added. What does a silent e usually do to the vowel before it?',
  o5: 'A vowel team is two vowel letters right next to each other. Count the vowel letters in each word.',
  o6: 'A team needs two e letters touching. Count the e letters in each word.',
  o7: 'A vowel team means the two vowel letters touch, with no letter between them. Check each word letter by letter.',
  o8: 'Long o can be spelled with a silent e or with a vowel team. This question wants the team, where o and a touch.',
  o9: 'Check the last letter of each word. If it ends in e, the vowel before it usually says its name. If not, the vowel is usually short.',
  o10: 'Find the two vowels next to each other in each word. Look at the first one: is it a or o?',
  o11: 'Every word has a team that starts with e. Look at the second letter of the team: is it another e or an a?',
  o12: 'Short u sounds like the u in up. A silent e at the end makes the u say its name instead.',
  o13: 'Long u says its name, like "you." A silent e at the end is a clue that the u will say its name.',
  o14: 'Say cap, then say cape. Listen to the a. Does it sound like the a in apple, or does it say its name?',
  o15: 'Look for a pair where the second word is the first word plus one e at the end. Then say both words and listen to the vowel change.',
  o16: 'Point to each letter in t-e-n-t. Count only the letters that are a, e, i, o, or u.',
  o17: 'Short i sounds like the i in it. A silent e at the end makes the i say its name instead.',
  o18: 'Short o sounds like the o in octopus. A silent e or the team oa makes the o say its name instead.',
  o19: 'Short e sounds like the e in egg. The team ee and a silent e both make the e say its name.',
  o20: 'First try each word in the blank and see which one makes sense. Then check the spelling for a and i side by side.',
  o21: 'Long o says its name, like in go. Look for a word where two vowel letters work together as a team.',
  o22: 'Long a can be spelled with ai or with a silent e. Check the end of each word for an e.',
  o23: 'Look at each letter by itself. Ask: is it one of the five vowel letters a, e, i, o, u?',
  o24: 'Say each word and listen. Does the vowel say its name? Then check the spelling for a silent e or two vowels together.'
};

/* Better Hint 1 where the old hint gave away the answer */

var H1 = {
  h6: 'Say the chant slowly from the start: can, could, may, might... What comes next?',
  h7: 'Say the chant out loud: shall, should, will... What comes next?',
  h8: 'Say the whole BE family: am, is, are, was, were, be, being... What is the last word?'
};

var RD_MAIN = [
  {
    "id": "rm1",
    "title": "How an Octopus Stays Safe",
    "type": "Nonfiction",
    "topic": "Ocean animals",
    "paras": [
      [
        "An octopus has no bones and no hard shell, but it has clever ways to stay safe.",
        "It can change the color of its skin in less than a second to match the rocks or sand around it.",
        "If a hungry fish still spots it, the octopus can squirt a dark cloud of ink and zoom away.",
        "Because its body is soft, an octopus can also squeeze into tiny cracks where bigger animals cannot follow."
      ]
    ],
    "qs": [
      {
        "id": "rm1q1",
        "sk": "main",
        "q": "What is the main idea of this passage?",
        "c": [
          "An octopus can squirt a dark cloud of ink.",
          "An octopus has several clever ways to stay safe.",
          "An octopus can squeeze into tiny cracks.",
          "Ocean animals have many ways to find food."
        ],
        "a": 1,
        "h": "Read the first sentence. Do the other sentences tell more about it?",
        "h2": "Changing color, squirting ink, and squeezing into cracks are three different tricks. The main idea is the bigger idea that all three tricks are about.",
        "ex": "The first sentence says an octopus has clever ways to stay safe, and each sentence after it tells one of those ways.",
        "why": [
          null,
          "This is true, but it is only one way the octopus stays safe.",
          "This is true, but it is only one way the octopus stays safe.",
          "The passage is about staying safe, not about finding food."
        ]
      }
    ]
  },
  {
    "id": "rm2",
    "title": "How a Cactus Lives in the Desert",
    "type": "Nonfiction",
    "topic": "Desert plants",
    "paras": [
      [
        "A desert may get only a little rain all year, but a cactus is built to live there.",
        "Its thick stem soaks up water after a storm and saves it for weeks or months.",
        "A waxy skin covers the stem and keeps the water from drying up in the hot sun.",
        "Instead of wide, flat leaves, most cactus plants have sharp spines that help keep thirsty animals away.",
        "Its roots spread out wide, just under the ground, so they can catch rain quickly."
      ]
    ],
    "qs": [
      {
        "id": "rm2q1",
        "sk": "main",
        "q": "What is this passage mostly about?",
        "c": [
          "A cactus has roots that spread out wide.",
          "A cactus has a waxy skin on its stem.",
          "All plants need sunlight and water to grow.",
          "A cactus has special parts that help it live where there is little rain."
        ],
        "a": 3,
        "h": "Ask: what do MOST of the sentences talk about?",
        "h2": "The passage tells about the stem, the skin, the spines, and the roots. Think about what all of those parts help the cactus do in a dry place.",
        "ex": "Every sentence tells about a part of the cactus that helps it live in the desert, where there is little rain.",
        "why": [
          "This is true, but it tells about only one part, the roots.",
          "This is true, but it tells about only one part, the skin.",
          "This is too big. The passage is only about how a cactus lives in the desert.",
          null
        ]
      }
    ]
  },
  {
    "id": "rm3",
    "title": "Life in the Slow Lane",
    "type": "Nonfiction",
    "topic": "Rain forest animals",
    "paras": [
      [
        "Sloths live high in the rain forest trees of Central and South America, and they move very slowly.",
        "A sloth eats mostly leaves, which do not give it much energy, so moving slowly helps it save energy.",
        "It spends most of its life hanging upside down from branches with its long, curved claws.",
        "Tiny green plants called algae grow in its fur and help it blend in with the leaves.",
        "A slow, green sloth is hard for a hungry eagle or jaguar to notice."
      ]
    ],
    "qs": [
      {
        "id": "rm3q1",
        "sk": "main",
        "q": "Which sentence BEST tells the main idea?",
        "c": [
          "Tiny green plants called algae grow in a sloth’s fur.",
          "Sloths hang upside down from branches with their claws.",
          "A sloth’s slow life in the trees helps it save energy and stay hidden.",
          "Many kinds of animals live in the rain forest."
        ],
        "a": 2,
        "h": "Look at the title. Then ask: why does a sloth live the way it does?",
        "h2": "Two big ideas run through the passage: saving energy and not being seen. The main idea should include both.",
        "ex": "The passage tells how a sloth moves slowly to save energy and how its slow, green body helps it hide from animals that hunt it.",
        "why": [
          "This is true, but it is one detail about how a sloth hides.",
          "This is true, but it is one detail about where a sloth spends its time.",
          null,
          "This is too big. The passage is only about sloths."
        ]
      }
    ]
  },
  {
    "id": "rm4",
    "title": "Built for the Desert",
    "type": "Nonfiction",
    "topic": "Desert animals",
    "paras": [
      [
        "Camels are built to live in hot, sandy deserts.",
        "A camel’s hump stores fat, not water, and its body can use that fat for energy when food is hard to find.",
        "A camel can go many days without drinking, and then it can gulp down a lot of water in just a few minutes.",
        "Long eyelashes and nostrils that can close help keep blowing sand out.",
        "Wide, padded feet keep a camel from sinking into the soft sand."
      ]
    ],
    "qs": [
      {
        "id": "rm4q1",
        "sk": "main",
        "q": "What is the main idea of this passage?",
        "c": [
          "A camel’s hump stores fat, not water.",
          "A camel’s body is made for life in the desert.",
          "Camels have long eyelashes.",
          "Deserts are very hot and sandy places."
        ],
        "a": 1,
        "h": "Read the first sentence. Then check: do the other sentences explain it?",
        "h2": "The hump, the drinking, the eyelashes, and the feet are all parts of the same idea. Ask: what do they all help a camel do?",
        "ex": "The first sentence says camels are built to live in deserts. Every other sentence tells a way the camel’s body helps it live there.",
        "why": [
          "This is true, but it is one detail about the hump.",
          null,
          "This is true, but it is one small detail.",
          "The passage is about camels, not mostly about deserts."
        ]
      }
    ]
  },
  {
    "id": "rm5",
    "title": "How a Hot Air Balloon Flies",
    "type": "Nonfiction",
    "topic": "Flight",
    "paras": [
      [
        "A hot air balloon flies because warm air is lighter than cool air.",
        "The pilot turns on a burner, and a flame heats the air inside the giant balloon.",
        "As the air inside gets warmer, the balloon rises and carries a basket of riders into the sky.",
        "To come back down, the pilot lets the air inside cool off."
      ],
      [
        "A pilot cannot steer left or right like a car.",
        "Instead, the wind decides which way the balloon travels."
      ]
    ],
    "qs": [
      {
        "id": "rm5q1",
        "sk": "main",
        "q": "What is this passage mostly about?",
        "c": [
          "A hot air balloon goes up and down by heating and cooling air, and the wind moves it along.",
          "A pilot turns on a burner to make a flame.",
          "The wind decides which way the balloon travels.",
          "People have many ways to travel through the sky."
        ],
        "a": 0,
        "h": "The title asks a question: how does a hot air balloon fly? Which choice answers it best?",
        "h2": "The first paragraph tells how a balloon goes up and down. The second tells how it moves from place to place. The main idea should cover both paragraphs.",
        "ex": "The passage explains that warm air makes the balloon rise, cooling air brings it down, and the wind carries it along.",
        "why": [
          null,
          "This is true, but it is only one step in the first paragraph.",
          "This is true, but it is only the second paragraph.",
          "This is too big. The passage only tells about hot air balloons."
        ]
      }
    ]
  },
  {
    "id": "rm6",
    "title": "A Swamp Full of Life",
    "type": "Nonfiction",
    "topic": "Georgia wetlands",
    "paras": [
      [
        "The Okefenokee Swamp in southern Georgia is one of the largest swamps in North America.",
        "Its water looks dark brown, like tea, because of the plants that soak in it.",
        "Thousands of alligators swim in the swamp, and tall birds called herons wade in shallow spots to catch fish.",
        "Some of its small islands are made of soft, spongy plants, so they wobble when someone steps on them.",
        "Today the swamp is a wildlife refuge, which keeps it a safe home for its animals."
      ]
    ],
    "qs": [
      {
        "id": "rm6q1",
        "sk": "main",
        "q": "Which sentence BEST tells the main idea?",
        "c": [
          "Alligators and herons live in the swamp.",
          "The water in the swamp looks dark brown, like tea.",
          "Georgia has many beautiful places to visit.",
          "The Okefenokee is a large, unusual swamp in Georgia where many animals live."
        ],
        "a": 3,
        "h": "Think about the whole passage. What place is every sentence about?",
        "h2": "The passage tells about the swamp’s size, its dark water, its animals, and its wobbly islands. Find the choice that is about the swamp as a whole.",
        "ex": "Every sentence tells something about the Okefenokee Swamp: how big it is, what makes it unusual, and the animals that live there.",
        "why": [
          "This is true, but it is only one detail about the animals.",
          "This is true, but it is only one detail about the water.",
          "This is too big. The passage is only about one place, the Okefenokee Swamp.",
          null
        ]
      }
    ]
  },
  { id: 'rm7', title: 'The Group Poster', type: 'Fiction', paras: [['Tasha wanted to make the whole planet poster by herself.', 'She told Leo and Kim to just watch.', 'Soon she ran out of time, and the poster was only half done.', 'Leo offered to draw the planets, and Kim offered to write the labels.', 'Together, they finished before the bell rang.', 'Tasha smiled and said, “Next time, let’s plan it together from the start.”']],
    qs: [{ id: 'rm7q1', sk: 'theme', q: 'What lesson does Tasha learn?', c: ['Working together can help a big job get done.', 'Posters about planets are fun to make.', 'Leo is the best artist in the class.', 'Tasha can finish any poster by herself.'], a: 0, h: 'How did Tasha change from the beginning to the end?', h2: 'A lesson is what the character learns, not just what happens. Look at what Tasha says at the end.', ex: 'Tasha tried to work alone and ran out of time. With help, the poster got done, and she wants to plan together next time.', why: [null, 'This is about the topic of the poster, not what Tasha learned.', 'The story never says Leo is the best artist.', 'This is the opposite of what happened.'] }] },
  { id: 'rm8', title: 'The Muddy Sneakers', type: 'Fiction', paras: [['Andre borrowed his brother’s new sneakers without asking and wore them to the park.', 'He stepped in a deep puddle, and the shoes got muddy.', 'Andre thought about hiding them in the closet.', 'Instead, he cleaned them with an old toothbrush and told his brother the truth.', 'His brother was upset at first, but then he said, “Thanks for being honest.”']],
    qs: [{ id: 'rm8q1', sk: 'theme', q: 'What is the lesson of this story?', c: ['Puddles are deep after it rains.', 'Telling the truth is the right choice, even after a mistake.', 'New sneakers cost a lot of money.', 'It is best to hide things that get messy.'], a: 1, h: 'What hard choice did Andre make?', h2: 'Theme is the message the story teaches. Think about why his brother thanked him.', ex: 'Andre chose to clean the shoes and tell the truth instead of hiding them, and his brother thanked him for being honest.', why: ['This is a detail from the story, not its lesson.', null, 'The story never talks about the price.', 'Andre thought about hiding them, but the story shows honesty was better.'] }] },
  { id: 'rm9', title: 'The Missing Library Book', type: 'Fiction', paras: [['Mia could not find her library book, and it was due the next day.', 'She looked in her backpack and under her bed.', 'Then she remembered reading it on the bus.', 'She asked the bus driver, Mr. Ellis, to check the lost and found box.', 'The book was there!', 'Mia returned it to the library on time.']],
    qs: [{ id: 'rm9q1', sk: 'problem', q: 'What was Mia’s problem, and how was it solved?', c: ['She lost her library book, and Mr. Ellis found it in the lost and found box.', 'She forgot to read her book, so she read it on the bus.', 'Her book was late, so she paid a fine.', 'She lost her backpack, and her mom bought a new one.'], a: 0, h: 'What went wrong for Mia at the start? What fixed it?', h2: 'The problem comes near the beginning. The solution is what finally makes it better near the end.', ex: 'Mia could not find her book. Remembering the bus led her to Mr. Ellis, who found it, so she returned it on time.', why: [null, 'The problem was finding the book, not reading it.', 'She returned it on time, so there was no fine.', 'She looked in her backpack; the backpack was not lost.'] }] },
  { id: 'rm10', title: 'Rain on Game Day', type: 'Fiction', paras: [['The Hawks were ready for their soccer game, but a storm flooded the field.', 'The players felt disappointed.', 'Coach Rivera had an idea.', 'She called the school and asked to use the gym.', 'The team practiced passing and played a small game indoors.', 'Everyone agreed it was still a fun day.']],
    qs: [{ id: 'rm10q1', sk: 'problem', q: 'How did Coach Rivera solve the team’s problem?', c: ['She waited until the storm stopped and the field dried.', 'She moved the team into the school gym to play inside.', 'She canceled the game and sent everyone home.', 'She found a new field across town.'], a: 1, h: 'What was the problem? What did the coach do about it?', h2: 'Find the sentence where the coach has an idea. Read what she does next.', ex: 'The flooded field was the problem. Coach Rivera got the gym, so the team could still play indoors.', why: ['The story never says they waited for the field to dry.', null, 'They still played, so the game was not just canceled.', 'The story does not mention another field.'] }] },
  { id: 'rm11', title: 'Penguins in the Cold', type: 'Nonfiction', paras: [['Emperor penguins live in Antarctica, one of the coldest places on Earth.', 'To stay warm, they huddle together in large groups.', 'The penguins take turns standing on the outside of the huddle, where it is coldest.', 'Thick feathers and a layer of fat also help keep their bodies warm.']],
    qs: [{ id: 'rm11q1', sk: 'detail', q: 'Why do the penguins take turns on the outside of the huddle?', c: ['The outside is the coldest spot, so they share it.', 'They are watching for food on the ice.', 'The inside is only for baby penguins.', 'They need to dry their feathers.'], a: 0, h: 'Find the sentence about taking turns.', h2: 'Read the whole sentence. It tells what the outside of the huddle is like.', ex: 'The passage says the outside of the huddle is where it is coldest, so the penguins take turns there.', why: [null, 'The passage does not mention food.', 'The passage does not say the inside is only for chicks.', 'The passage does not talk about drying feathers.'] }] },
  { id: 'rm12', title: 'The Tallest Trees', type: 'Nonfiction', paras: [['Coast redwoods are the tallest trees in the world.', 'Some grow taller than a thirty story building.', 'They grow along the foggy coast of California.', 'Fog helps the trees by giving them water during dry summers.', 'Redwood bark is very thick, which helps protect the trees from fire.']],
    qs: [{ id: 'rm12q1', sk: 'detail', q: 'What helps redwoods get water during dry summers?', c: ['Thick bark', 'Fog', 'Deep rivers', 'Melting snow'], a: 1, h: 'Find the words "dry summers" in the passage.', h2: 'Two details are about how redwoods stay safe and healthy. Only one is about water.', ex: 'The passage says fog gives the trees water during dry summers.', why: ['Thick bark protects the trees from fire, not dryness.', null, 'The passage does not mention rivers.', 'The passage does not mention snow.'] }] }
];

var LESSONS_REPLACE_READING = {
  "reading": [
    {
      "id": "A",
      "title": "Main Idea",
      "skill": "main",
      "key": "The main idea is what the whole passage is mostly about.",
      "steps": [
        {
          "t": "explain",
          "img": "reading",
          "title": "Main idea",
          "text": [
            "The main idea is what a passage is MOSTLY about.",
            "It is bigger than one detail.",
            "Tip: ask, \"What do most sentences talk about?\""
          ],
          "box": [
            "Detail: Some seeds ride on the wind.",
            "Detail: Some seeds stick to animal fur.",
            "Main idea: Seeds can travel in different ways."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Dogs help people in many ways.",
            "Some dogs guide people who cannot see.",
            "Some dogs help find people who are lost.",
            "Other dogs visit hospitals to cheer people up."
          ],
          "q": {
            "q": "What is this mostly about?",
            "c": [
              "Dogs visit hospitals.",
              "Dogs help people in many ways.",
              "Dogs like to play fetch."
            ],
            "a": 1,
            "h": "Which answer covers ALL the sentences, not just one?",
            "h2": "Each sentence after the first tells one job a dog can do. The main idea is the bigger idea those jobs fit under.",
            "ex": "Every sentence tells a way dogs help. Visiting hospitals is only one detail.",
            "why": [
              "This is true, but it is only one detail.",
              null,
              "The passage never talks about playing fetch."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "Read each sentence and ask, \"What is this one about?\" You might say fruit, bread, music, and seeds. Now look for the answer that covers ALL of them, not just one.",
          "mini": [
            "On Saturday mornings, the farmers market in our town is full of good things.",
            "Farmers sell peaches, beans, and sweet corn that they picked that week.",
            "A baker sells warm bread and muffins.",
            "A man plays the banjo near the fountain while people listen.",
            "Kids can even plant a seed in a cup to take home."
          ],
          "q": {
            "q": "What is this passage mostly about?",
            "c": [
              "Farmers sell peaches, beans, and sweet corn.",
              "The farmers market has many good things to buy, hear, and do.",
              "A man plays the banjo near the fountain.",
              "Every town has a market on Saturday."
            ],
            "a": 1,
            "h": "Which answer could be a title for the WHOLE passage?",
            "h2": "The first sentence says the market is full of good things. The other sentences each name one of those things.",
            "ex": "Food, music, and planting seeds are all good things at the market. The main idea covers all of them.",
            "why": [
              "This is true, but it is only one detail.",
              null,
              "This is true, but it is only one detail.",
              "The passage is only about one market in one town."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "A kangaroo’s body is made for hopping.",
            "Its back legs are long and strong, so it can jump far.",
            "Its big feet push off the ground like springs.",
            "Its thick tail helps it keep its balance."
          ],
          "q": {
            "q": "What is the main idea?",
            "c": [
              "A kangaroo has big feet.",
              "A kangaroo has a thick tail.",
              "A kangaroo’s body is made for hopping.",
              "Animals in Australia move very fast."
            ],
            "a": 2,
            "h": "What do the legs, feet, and tail all help a kangaroo do?",
            "h2": "Each sentence after the first names one body part. Check whether the first sentence tells what all those parts are for.",
            "ex": "The legs, feet, and tail all help the kangaroo hop. The main idea is that its body is made for hopping.",
            "why": [
              "This is true, but it is only one detail.",
              "This is true, but it is only one detail.",
              null,
              "This is too big. The passage only tells about kangaroos."
            ]
          }
        }
      ]
    },
    {
      "id": "B",
      "title": "Supporting Details",
      "skill": "detail",
      "key": "Details are facts that tell more about the main idea.",
      "steps": [
        {
          "t": "explain",
          "title": "Details",
          "text": [
            "Details are small facts in the passage.",
            "They tell more about the main idea.",
            "You can point to them in the text."
          ],
          "box": [
            "Main idea: Our class trip to the farm was fun.",
            "Detail: We fed the goats.",
            "Detail: We rode in a hay wagon."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Ms. Lee’s class grew bean plants.",
            "They put the seeds in cups of soil.",
            "They watered the cups every Monday.",
            "In two weeks, green sprouts popped up."
          ],
          "q": {
            "q": "When did the class water the cups?",
            "c": [
              "Every Monday",
              "Every Friday",
              "Once a month"
            ],
            "a": 0,
            "h": "Find the word watered. Read that sentence.",
            "h2": "The question asks WHEN, so look for a time word in the sentence about watering.",
            "ex": "The passage says they watered the cups every Monday.",
            "why": [
              null,
              "Friday is not in the passage.",
              "The passage says they watered every week, not once a month."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "The question asks WHERE. Look for a sentence with a place word, like near, by, or in. Then check that the sentence is about where the garden went.",
          "mini": [
            "Mr. Okafor’s class planned a garden for the school.",
            "They chose a sunny spot near the gym.",
            "They planted tomatoes in one row and peppers in another.",
            "Every Friday, two students pulled weeds.",
            "By June, the plants were taller than the fence."
          ],
          "q": {
            "q": "Which detail tells WHERE the class put the garden?",
            "c": [
              "Near the gym",
              "Next to the fence",
              "In one long row",
              "Inside the classroom"
            ],
            "a": 0,
            "h": "Find the sentence that tells about the spot they chose.",
            "h2": "The word spot is a clue. A spot is a place.",
            "ex": "The passage says they chose a sunny spot near the gym.",
            "why": [
              null,
              "The fence is only used to tell how tall the plants got.",
              "Rows tell how the plants were lined up, not where the garden was.",
              "The passage never says the garden was inside."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "Jada’s grandma is a great cook.",
            "She makes the best sweet potato pie on her street.",
            "Neighbors ask her for her cornbread recipe.",
            "She also grows herbs in pots by her window."
          ],
          "q": {
            "q": "Which detail BEST shows that Jada’s grandma is a great cook?",
            "c": [
              "She grows herbs in pots by her window.",
              "Neighbors ask her for her cornbread recipe.",
              "She lives on a busy street.",
              "She has a big, sunny kitchen."
            ],
            "a": 1,
            "h": "Which detail is about her COOKING?",
            "h2": "People ask for a recipe when they love the food. Look for the choice that shows others think her food is good.",
            "ex": "Neighbors ask for her cornbread recipe, which shows they think she is a great cook.",
            "why": [
              "This is true, but growing herbs is about gardening, not about being a great cook.",
              null,
              "The passage does not say her street is busy.",
              "The passage never tells about her kitchen."
            ]
          }
        }
      ]
    },
    {
      "id": "C",
      "title": "Sequence",
      "skill": "sequence",
      "key": "Sequence is the order things happen.",
      "steps": [
        {
          "t": "explain",
          "title": "Sequence",
          "text": [
            "Sequence is the order things happen.",
            "Signal words help: first, next, then, last."
          ],
          "box": [
            "First, Lena filled the tub.",
            "Then she washed the dog.",
            "Last, she dried him with a towel."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "First, Zoe got out the bread.",
            "Next, she spread peanut butter on it.",
            "Then she added banana slices.",
            "Last, she ate her snack."
          ],
          "q": {
            "q": "What did Zoe do right after she spread peanut butter?",
            "c": [
              "She got out the bread.",
              "She added banana slices.",
              "She ate her snack."
            ],
            "a": 1,
            "h": "Find \"peanut butter.\" Then look for the signal word that comes after it.",
            "h2": "\"Right after\" means the very next step. Read the sentence that comes just after the peanut butter sentence.",
            "ex": "After peanut butter comes \"Then she added banana slices.\"",
            "why": [
              "That happened FIRST, before the peanut butter.",
              null,
              "That happened last, not right after."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "Find the words \"wrote his name.\" Read that whole sentence. The word After tells you what happened just before it. Not every step has a signal word, so read carefully.",
          "mini": [
            "Darius wanted to make a paper airplane.",
            "He folded a sheet of paper in half the long way.",
            "Next, he folded the top corners down to make a point.",
            "After he made the wings, he wrote his name on the side.",
            "Finally, he tossed it across the backyard."
          ],
          "q": {
            "q": "What did Darius do right before he wrote his name?",
            "c": [
              "He folded the paper in half.",
              "He folded the top corners down.",
              "He made the wings.",
              "He tossed it across the backyard."
            ],
            "a": 2,
            "h": "Look at the sentence that tells about his name.",
            "h2": "The word After starts that sentence. The step named right after the word After is the one that came just before.",
            "ex": "The passage says, \"After he made the wings, he wrote his name on the side.\"",
            "why": [
              "That was an early step, not right before.",
              "He folded the corners before he made the wings.",
              null,
              "He tossed it last, after he wrote his name."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "When the storm was over, Imani and her dad went outside.",
            "They picked up the sticks that had fallen in the yard.",
            "Then Imani found a bird nest on the grass.",
            "Her dad helped her set it back in the tree.",
            "Later, a mother robin flew back to the nest."
          ],
          "q": {
            "q": "What happened right after Imani found the nest?",
            "c": [
              "They picked up sticks in the yard.",
              "Her dad helped her set it back in the tree.",
              "A mother robin flew back to the nest.",
              "The storm ended."
            ],
            "a": 1,
            "h": "Find the sentence about the nest on the grass. Read the next one.",
            "h2": "The robin came Later, so that is not RIGHT after. Look for the step just after Imani found the nest.",
            "ex": "Right after Imani found the nest, her dad helped her set it back in the tree.",
            "why": [
              "They did that BEFORE she found the nest.",
              null,
              "That happened later, not right after.",
              "The storm ended at the very beginning."
            ]
          }
        }
      ]
    },
    {
      "id": "D",
      "title": "Making an Inference",
      "skill": "inference",
      "key": "Use a clue from the story and what you already know.",
      "steps": [
        {
          "t": "explain",
          "title": "Inference",
          "text": [
            "Sometimes the story does not say everything.",
            "Use a clue from the story and what you already know.",
            "Clue + what I know = inference."
          ],
          "box": [
            "Clue: Maya yawned and rubbed her eyes.",
            "What I know: People yawn when they are sleepy.",
            "Inference: Maya was tired."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Ben came inside and shook off his umbrella.",
            "His boots left wet tracks on the floor.",
            "He hung his dripping coat on the hook."
          ],
          "q": {
            "q": "What was the weather most likely like outside?",
            "c": [
              "Sunny and dry",
              "Rainy",
              "Snowy and windy"
            ],
            "a": 1,
            "h": "Clues: umbrella, wet tracks, dripping coat. What do you know about umbrellas?",
            "h2": "Everything Ben has is wet, and he used an umbrella. Think about the kind of weather people carry umbrellas for.",
            "ex": "Clues: umbrella and dripping coat. I know people use umbrellas in the rain. So it was rainy.",
            "why": [
              "Ben’s things were wet, so it was not dry outside.",
              null,
              "Nothing tells about snow or wind. An umbrella and dripping coat point to rain."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "Pick out the clues one at a time: chocolate on her chin, hands hidden behind her back, only three cookies left. Then add what you know: kids sometimes hide what they have been doing.",
          "mini": [
            "Omar walked into the kitchen and sniffed the air.",
            "A plate of warm cookies sat on the counter.",
            "His little sister had chocolate on her chin.",
            "She smiled and hid her hands behind her back.",
            "Only three cookies were left on the plate."
          ],
          "q": {
            "q": "What most likely happened before Omar came in?",
            "c": [
              "His sister ate some of the cookies.",
              "Omar baked the cookies by himself.",
              "The cookies burned in the oven.",
              "His sister threw the cookies away."
            ],
            "a": 0,
            "h": "Look at the clues about his little sister.",
            "h2": "Chocolate on her chin is a clue about her mouth. Hiding her hands is a clue that she does not want to be caught.",
            "ex": "Clues: chocolate on her chin, hidden hands, few cookies left. I know that is what a sneaky snack looks like. So she ate some cookies.",
            "why": [
              null,
              "Omar just walked in, and nothing says he baked.",
              "The cookies were warm and on a plate, not burned.",
              "The chocolate on her chin shows she ate them, not threw them away."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "Tasha put on her helmet and knee pads.",
            "She grabbed her skateboard from the porch.",
            "Her friends were waiting at the park with their boards.",
            "She waved and shouted, “Wait for me!”"
          ],
          "q": {
            "q": "What is Tasha most likely going to do next?",
            "c": [
              "Fix her skateboard at home",
              "Watch her friends from the porch",
              "Skateboard at the park with her friends",
              "Ride her bike to the park"
            ],
            "a": 2,
            "h": "What did she grab, and who is waiting for her?",
            "h2": "She shouted, \"Wait for me!\" Think about what that tells you about where she is going and why.",
            "ex": "Clues: helmet, skateboard, friends with boards, \"Wait for me!\" So she is going to skateboard with her friends.",
            "why": [
              "Nothing says her board is broken. She is heading out.",
              "She shouted, \"Wait for me!\" so she plans to join them.",
              null,
              "She grabbed a skateboard, not a bike."
            ]
          }
        }
      ]
    },
    {
      "id": "E",
      "title": "Vocabulary in Context",
      "skill": "vocab",
      "key": "Use the words around a new word to figure out what it means.",
      "steps": [
        {
          "t": "explain",
          "title": "Word detective",
          "text": [
            "When you see a new word, read the sentences around it.",
            "Those clues can tell you what the word means."
          ],
          "box": [
            "The soup was scalding, so Grandpa let it cool before he ate.",
            "Clue: he let it cool first.",
            "Scalding means very hot."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "The puppy was so tiny that it fit inside a teacup.",
            "It was smaller than a shoe."
          ],
          "q": {
            "q": "What does tiny mean?",
            "c": [
              "Very small",
              "Very loud",
              "Very fast"
            ],
            "a": 0,
            "h": "Clues: fit inside a teacup, smaller than a shoe.",
            "h2": "Both clues tell about the puppy’s size. Picture a puppy that fits in a cup.",
            "ex": "Something that fits in a teacup is very small. Tiny means very small.",
            "why": [
              null,
              "The clues tell about size, not sound.",
              "The clues tell about size, not speed."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "Timid is the new word. Do not stop at its sentence. Each sentence after it shows what Pepper does. Ask: what kind of dog hides, shakes, and peeks out?",
          "mini": [
            "Mateo’s dog, Pepper, is very timid.",
            "When the doorbell rings, she hides under the bed.",
            "She shakes when she hears thunder.",
            "If a new person walks in, she peeks out from behind the couch.",
            "Mateo talks to her softly so she will not be afraid."
          ],
          "q": {
            "q": "What does timid mean?",
            "c": [
              "Shy and easily scared",
              "Loud and bossy",
              "Sleepy and slow",
              "Playful and full of energy"
            ],
            "a": 0,
            "h": "What does Pepper do when something new happens?",
            "h2": "The last sentence says Mateo talks softly so she will not be afraid. That is a big clue about how Pepper often feels.",
            "ex": "Pepper hides, shakes, and peeks out, and Mateo helps her not be afraid. Timid means shy and easily scared.",
            "why": [
              null,
              "A bossy dog would not hide under the bed.",
              "Hiding under the bed might look like napping, but she hides because of the doorbell.",
              "A playful dog would run to the door, not hide."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "The path up the hill was steep.",
            "Amara had to lean forward and take small steps.",
            "Halfway up, she stopped to catch her breath.",
            "Going down was easier, but she held the rail so she would not slide."
          ],
          "q": {
            "q": "What does steep mean?",
            "c": [
              "Flat and smooth",
              "Going sharply up or down",
              "Short and easy",
              "Wet and muddy"
            ],
            "a": 1,
            "h": "How did Amara walk up the path? What did she do going down?",
            "h2": "She leaned forward, got out of breath, and held a rail going down. Think about what kind of hill makes you do all of that.",
            "ex": "Amara leaned forward, stopped to breathe, and held the rail so she would not slide. Steep means going sharply up or down.",
            "why": [
              "A flat path would not make her lean or lose her breath.",
              null,
              "She had to stop halfway, so it was not easy.",
              "She held the rail so she would not slide, but nothing says the path was wet."
            ]
          }
        }
      ]
    },
    {
      "id": "F",
      "title": "Finding Evidence",
      "skill": "evidence",
      "key": "Evidence is the sentence in the text that proves your answer.",
      "steps": [
        {
          "t": "explain",
          "title": "Prove it!",
          "text": [
            "Evidence is a sentence from the text that proves your answer.",
            "Good readers can point to it.",
            "In this app, you tap the sentence."
          ],
          "box": [
            "Question: Was Kai brave?",
            "Evidence: Kai jumped off the high dive even though his legs were shaking."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Ava wanted to make the team.",
            "She practiced catching every day after school.",
            "On try-out day, she caught every ball.",
            "The coach smiled and handed her a jersey."
          ],
          "q": {
            "k": "ev",
            "q": "Tap the sentence that shows Ava worked hard.",
            "ok": [
              1
            ],
            "h": "Which sentence tells something she did again and again?",
            "h2": "Hard work means doing something many times to get better. Look for a sentence with a time word like every.",
            "ex": "\"She practiced catching every day after school.\" shows hard work."
          },
          "ev": true
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "First, say in your own words what you are looking for: a moment when things were hard and Zuri kept going. Then read each sentence and ask, \"Does this one PROVE it?\"",
          "mini": [
            "Zuri’s team was behind by one goal.",
            "She felt tired, but she kept running hard.",
            "Her coach shouted, “You can do it, Zuri!”",
            "In the last minute, she kicked the ball into the net to tie the game.",
            "Her teammates cheered and lifted her up."
          ],
          "q": {
            "k": "ev",
            "q": "Tap the sentence that proves Zuri kept going even when it was hard.",
            "ok": [
              1
            ],
            "h": "Find a sentence that tells how Zuri felt AND what she did.",
            "h2": "Look for the word but. It often shows someone doing something even though it is hard.",
            "ex": "\"She felt tired, but she kept running hard.\" shows she did not give up even when she was tired."
          },
          "ev": true
        },
        {
          "t": "reading",
          "mini": [
            "Rosa’s family moved to a new city.",
            "On her first day of school, she did not know anyone.",
            "At lunch, a girl named Keira waved her over to sit together.",
            "They both liked drawing horses, so they traded pictures.",
            "By Friday, Rosa and Keira were best friends."
          ],
          "q": {
            "k": "ev",
            "q": "Tap the sentence that shows Keira was kind to Rosa.",
            "ok": [
              2
            ],
            "h": "Find something Keira did for Rosa when Rosa did not know anyone.",
            "h2": "Rosa was alone on her first day. Look for the sentence where Keira does something to include her.",
            "ex": "\"At lunch, a girl named Keira waved her over to sit together.\" shows Keira was kind to a new student."
          },
          "ev": true
        }
      ]
    },
    {
      "id": "G",
      "title": "Theme / Lesson",
      "skill": "theme",
      "key": "The theme is the lesson a character learns or the message a story teaches.",
      "steps": [
        {
          "t": "explain",
          "title": "Theme",
          "text": [
            "The theme is the lesson a story teaches.",
            "Ask: What did the character learn? What could I learn too?",
            "A theme is a message that fits many stories, not just this one."
          ],
          "box": [
            "Story: Max would not share his blocks, so nobody played with him. When he shared, everyone built a tower together.",
            "Lesson: Sharing makes playing more fun."
          ]
        },
        {
          "t": "explain",
          "title": "Lesson, main idea, or summary?",
          "text": [
            "A summary tells WHAT HAPPENED.",
            "The main idea tells what the story is MOSTLY ABOUT.",
            "The theme tells the LESSON, a message you can use in your own life."
          ],
          "box": [
            "Summary: Max would not share, then he shared and built a tower with friends.",
            "Main idea: A boy learns to share his blocks.",
            "Theme: Sharing makes playing more fun."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Lily rushed through her spelling test.",
            "She finished first, but she missed six words.",
            "The next week, she went slowly and checked her work.",
            "She missed only one word."
          ],
          "q": {
            "q": "What lesson does Lily learn?",
            "c": [
              "Taking your time helps you do your best.",
              "Lily finished her spelling test first.",
              "Spelling tests are too hard."
            ],
            "a": 0,
            "h": "What did Lily do differently the second time? What happened?",
            "h2": "Compare the two weeks. The lesson is the message about what worked better, not a fact about one test.",
            "ex": "When Lily rushed, she missed six words. When she slowed down and checked, she missed one. The lesson is that taking your time helps you do your best.",
            "why": [
              null,
              "This tells what happened. It is not a lesson.",
              "Lily did much better when she slowed down, so the tests were not too hard."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "Look at how Kendrick changes. At the start he laughs at slower kids. At the end he cheers for everyone. Ask: what made him change, and what did he learn? Choose the lesson, not the list of events.",
          "mini": [
            "Kendrick wanted to be the fastest runner in his class.",
            "He laughed at kids who ran slower than he did.",
            "At field day, he tripped and scraped his knee.",
            "A slower runner named Paulo stopped and helped him up.",
            "Kendrick felt ashamed of how he had acted.",
            "The next day, he cheered for every runner, fast or slow."
          ],
          "q": {
            "q": "What is the theme of this story?",
            "c": [
              "Kendrick trips at field day, and Paulo helps him up.",
              "Being kind matters more than being the fastest.",
              "Kendrick wants to be the fastest runner in his class.",
              "It is not safe to run at field day."
            ],
            "a": 1,
            "h": "Why did Kendrick feel ashamed?",
            "h2": "Paulo was slower, but he was the one who stopped to help. Think about what that taught Kendrick about what really matters.",
            "ex": "Kendrick learned from Paulo’s kindness and began cheering for everyone. The theme is that being kind matters more than being the fastest.",
            "why": [
              "This is a summary of what happened, not the lesson.",
              null,
              "This is a detail from the beginning. It is not what he learned.",
              "Tripping was an accident. The story is about how Kendrick treats others."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "Nadia wanted to play a song on the keyboard for her family.",
            "The first time she tried, she hit many wrong keys.",
            "She felt like quitting, but she practiced a little every day.",
            "After two weeks, she could play it with only one mistake.",
            "On Sunday, she played the whole song, and her family clapped."
          ],
          "q": {
            "q": "What is the theme of this story?",
            "c": [
              "Nadia plays a song for her family on Sunday.",
              "If you keep practicing, you can get better.",
              "Playing the keyboard is very hard.",
              "Families should clap for each other."
            ],
            "a": 1,
            "h": "How did Nadia change from the first try to Sunday?",
            "h2": "She almost quit, but she kept doing something every day. Think about the message that choice teaches.",
            "ex": "Nadia kept practicing even when she wanted to quit, and she got better. The theme is that practice helps you improve.",
            "why": [
              "This is what happened at the end. It is a summary, not a lesson.",
              null,
              "It was hard at first, but the story shows she got better. That is the message.",
              "Her family clapped, but that is a detail, not what the story teaches."
            ]
          }
        }
      ]
    },
    {
      "id": "H",
      "title": "Character Problem and Solution",
      "skill": "problem",
      "key": "A story problem is what goes wrong for a character, and the solution is how it gets fixed.",
      "steps": [
        {
          "t": "explain",
          "title": "Problem and solution",
          "text": [
            "Most stories have a problem: something goes wrong, or a character wants something.",
            "The solution is how the problem gets fixed.",
            "Ask: Who has the problem? What is it? How is it solved?"
          ],
          "box": [
            "Story: Eli’s cat got stuck in a tree. Eli’s mom got a ladder and carried the cat down.",
            "Who: Eli and his cat",
            "Problem: The cat was stuck in a tree.",
            "Solution: Mom used a ladder to bring the cat down."
          ]
        },
        {
          "t": "reading",
          "mini": [
            "Sam wanted his favorite book.",
            "It was on the top shelf, and he could not reach it.",
            "His big brother came in and handed it to him."
          ],
          "q": {
            "q": "What was Sam’s problem?",
            "c": [
              "He could not reach his book on the top shelf.",
              "His big brother took his book.",
              "He did not like to read."
            ],
            "a": 0,
            "h": "What did Sam want? What got in the way?",
            "h2": "A problem is something that stops a character from getting what they want. Look for the words \"could not.\"",
            "ex": "Sam wanted his book, but it was on the top shelf and he could not reach it. That was his problem.",
            "why": [
              null,
              "His brother HELPED. He handed Sam the book.",
              "Sam wanted his favorite book, so he likes to read."
            ]
          }
        },
        {
          "t": "reading",
          "guided": true,
          "coach": "First, name the problem: the kitten is missing. Then look for what WORKED. Be careful: the first thing the family tried did not work. The solution is what finally fixed it.",
          "mini": [
            "The Brooks family’s new kitten, Biscuit, was missing.",
            "They looked under every bed and behind every chair, but they could not find him.",
            "Then Xavier had an idea.",
            "He filled Biscuit’s bowl and shook the bag of kitten treats.",
            "Soon a tiny meow came from the laundry basket, and Biscuit climbed out."
          ],
          "q": {
            "q": "How was the problem solved?",
            "c": [
              "The family looked under every bed and chair.",
              "Xavier used food and treats to get Biscuit to come out.",
              "The family went to the store for a new kitten.",
              "Biscuit came back to his bowl by himself."
            ],
            "a": 1,
            "h": "Find the sentence that starts \"Then Xavier had an idea.\" What did he do?",
            "h2": "Looking everywhere did not work. Think about what Xavier did that made Biscuit want to come out.",
            "ex": "Xavier filled the bowl and shook the treat bag. That brought Biscuit out of the laundry basket, so the problem was solved.",
            "why": [
              "They tried that first, but they could not find him.",
              null,
              "The story never says they went to a store.",
              "Biscuit came out after Xavier shook the treats, not on his own."
            ]
          }
        },
        {
          "t": "reading",
          "mini": [
            "Kayla’s soccer team needed new balls.",
            "Their old balls were flat and torn.",
            "The team did not have enough money to buy new ones.",
            "So Kayla and her teammates washed cars in the school parking lot.",
            "They earned enough to buy six new balls."
          ],
          "q": {
            "q": "What problem did the team have, and how did they solve it?",
            "c": [
              "They needed new balls, so the coach bought them.",
              "They needed new balls, so they washed cars to earn money.",
              "Their field was muddy, so they washed cars.",
              "They lost a game, so they practiced more."
            ],
            "a": 1,
            "h": "Ask: what did the team need? Then ask: what did they do to get it?",
            "h2": "Two choices name the right problem. Check the solution part. Who did the work to get the money?",
            "ex": "The team needed new balls but did not have the money. They washed cars and earned enough to buy six new balls.",
            "why": [
              "The problem is right, but the coach did not buy them. The team earned the money.",
              null,
              "The passage never says the field was muddy.",
              "The passage never tells about losing a game."
            ]
          }
        }
      ]
    }
  ]
};
var LESSONS_ADD_ALL = [LESSONS_ADD_GRAMMAR, LESSONS_ADD_WORD, LESSONS_ADD_WORKSHOP];
var LESSONS_REPLACE_ALL = [LESSONS_REPLACE_BRIDGES, LESSONS_REPLACE_READING];
/* ===== GRADE 3 ADDITIONS END ===== */
