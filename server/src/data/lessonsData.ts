import type { LessonQuestion } from '../models/Lesson.js';
import type { Level } from '../models/User.js';

export interface LessonSeed {
  slug: string;
  order: number;
  title: string;
  titleSi: string;
  level: Level;
  explanation: string[];
  sinhalaNotes: string[];
  examples: { en: string; si: string }[];
  questions: LessonQuestion[];
}

type Q = Omit<LessonQuestion, 'id'>;
const mc = (prompt: string, options: string[], answer: string, explanation: string): Q => ({
  type: 'mc',
  prompt,
  options,
  answers: [answer],
  explanation,
});
const fill = (prompt: string, answers: string[], explanation: string): Q => ({
  type: 'fill',
  prompt,
  answers,
  explanation,
});
const tf = (prompt: string, truth: boolean, explanation: string): Q => ({
  type: 'tf',
  prompt,
  options: ['True', 'False'],
  answers: [truth ? 'true' : 'false'],
  explanation,
});
const withIds = (slug: string, qs: Q[]): LessonQuestion[] =>
  qs.map((q, i) => ({ ...q, id: `${slug}-${i + 1}` }));

export const lessonsSeed: LessonSeed[] = [
  {
    slug: 'articles',
    order: 1,
    title: 'Articles: a, an, the',
    titleSi: 'Articles (a, an, the)',
    level: 'Beginner',
    explanation: [
      'Use "a" or "an" before a singular noun when you mean any one thing, or when you mention it for the first time.',
      'Use "an" before a vowel sound (an apple, an hour) and "a" before a consonant sound (a book, a university).',
      'Use "the" when both the speaker and the listener know which thing is meant (the door, the sun).',
      'Do not use an article with plural or uncountable nouns in general statements: "I like music."',
    ],
    sinhalaNotes: [
      'සිංහලයේ "a / an / the" වැනි වචන නැත. එහෙත් ඉංග්‍රීසියෙන් ඒවා බොහෝ විට අවශ්‍යයි.',
      '"a / an" = "එක්" හෝ "කිසියම්" දෙයක්. උදා: "පොතක්" = a book.',
      '"an" භාවිතා කරන්නේ ස්වර ශබ්දයකින් (a, e, i, o, u) පටන් ගන්නා වචන ඉදිරියෙනි. උදා: an apple.',
      '"the" = දෙදෙනාම දන්නා නිශ්චිත දෙයක්. උදා: "ඒ පොත" = the book.',
    ],
    examples: [
      { en: 'I have a book.', si: 'මට පොතක් තියෙනවා.' },
      { en: 'She eats an apple every day.', si: 'ඇය හැම දවසකම ඇපල් ගෙඩියක් කනවා.' },
      { en: 'The book is on the table.', si: 'ඒ පොත මේසය උඩ තියෙනවා.' },
      { en: 'The sun is very hot today.', si: 'අද සූර්යයා ඉතා උණුසුමයි.' },
    ],
    questions: withIds('articles', [
      mc(
        'I saw ___ elephant at the zoo.',
        ['a', 'an', 'the', 'no article'],
        'an',
        '"Elephant" starts with a vowel sound, so we use "an".',
      ),
      mc(
        'She is ___ teacher.',
        ['a', 'an', 'the', 'no article'],
        'a',
        '"Teacher" starts with a consonant sound, so we use "a".',
      ),
      fill('He has ___ umbrella.', ['an'], '"Umbrella" starts with a vowel sound, so we use "an".'),
      mc(
        'Please close ___ door.',
        ['a', 'an', 'the', 'no article'],
        'the',
        'Both people know which door, so we use "the".',
      ),
      tf(
        'We say "a hour".',
        false,
        '"Hour" starts with a vowel sound (the h is silent), so we say "an hour".',
      ),
      fill('I want ___ orange.', ['an'], '"Orange" starts with a vowel sound, so we use "an".'),
      mc(
        '___ moon goes around the earth.',
        ['A', 'An', 'The', 'No article'],
        'The',
        'There is only one moon, so we use "the".',
      ),
      tf(
        'We use "the" for something both the speaker and the listener know.',
        true,
        '"The" points to a specific, known thing.',
      ),
    ]),
  },
  {
    slug: 'to-be',
    order: 2,
    title: 'To be: am, is, are',
    titleSi: 'To be (am, is, are)',
    level: 'Beginner',
    explanation: [
      '"To be" has three present forms: I am, he / she / it is, and you / we / they are.',
      'Negative: add "not" after the verb (She is not at home). Short forms: isn\'t, aren\'t.',
      'Questions: put the verb before the subject (Are you ready? Is he a doctor?).',
      'Use "to be" to describe who or what someone is, where they are, and how they feel.',
    ],
    sinhalaNotes: [
      'සිංහලයේ "ය / වෙයි" වැනි වචන බොහෝ විට නොකියා ඉවත් වෙයි: "මම ශිෂ්‍යයෙක්". ඉංග්‍රීසියෙන් am / is / are අනිවාර්යයි: "I am a student."',
      'I → am,  he / she / it → is,  you / we / they → are.',
      'ප්‍රශ්න අසන විට verb එක මුලට එයි: "Are you ready?" = "ඔබ සූදානම්ද?"',
      'ප්‍රතික්ෂේප කිරීමට "not" එක් කරන්න: "He is not here." = "ඔහු මෙහි නැහැ."',
    ],
    examples: [
      { en: 'I am a student.', si: 'මම ශිෂ්‍යයෙක්.' },
      { en: 'She is happy.', si: 'ඇය සතුටින් ඉන්නවා.' },
      { en: 'They are at home.', si: 'ඔවුන් ගෙදර ඉන්නවා.' },
      { en: 'Are you ready?', si: 'ඔබ සූදානම්ද?' },
      { en: 'He is not here.', si: 'ඔහු මෙහි නැහැ.' },
    ],
    questions: withIds('to-be', [
      mc('She ___ a doctor.', ['am', 'is', 'are', 'be'], 'is', '"She" takes "is".'),
      mc('We ___ friends.', ['am', 'is', 'are', 'be'], 'are', '"We" takes "are".'),
      fill('I ___ hungry.', ['am', "i'm"], '"I" takes "am".'),
      fill('They ___ not at school today.', ['are'], '"They" takes "are".'),
      tf('"He are tall" is correct.', false, '"He" takes "is": "He is tall."'),
      mc(
        '___ you from Sri Lanka?',
        ['Am', 'Is', 'Are', 'Be'],
        'Are',
        'In questions the verb comes first, and "you" takes "are".',
      ),
      mc('It ___ cold today.', ['am', 'is', 'are', 'be'], 'is', '"It" takes "is".'),
      fill('My brother ___ ten years old.', ['is'], '"My brother" means "he", so we use "is".'),
    ]),
  },
  {
    slug: 'present-simple',
    order: 3,
    title: 'Present simple',
    titleSi: 'Present simple (සාමාන්‍ය වර්තමාන කාලය)',
    level: 'Beginner',
    explanation: [
      'Use the present simple for habits, routines and facts: "I drink tea every morning." "Water boils at 100°C."',
      'With I / you / we / they use the base verb. With he / she / it add -s or -es (works, watches, goes).',
      'Negative: do not / does not + base verb. Question: Do / Does + subject + base verb.',
      'After "does" or "doesn\'t" the main verb has no -s: "Does she like tea?"',
    ],
    sinhalaNotes: [
      'හැම දවසකම කරන දේවල්, සත්‍ය කරුණු සඳහා මෙය භාවිතා කරයි. උදා: "මම හැම උදේම තේ බොනවා."',
      'he / she / it සමඟ verb එකට -s / -es එකතු කරන්න: She works. He goes.',
      '"do / does" යොදන විට ඊට පසු verb එක මුල් රූපයෙන්ම ලියන්න: "She does not work." (works නොවේ).',
      'සිංහලයේ "-නවා" අවසානය බොහෝ විට මෙම කාලයට අදාළයි.',
    ],
    examples: [
      { en: 'I drink tea every morning.', si: 'මම හැම උදේම තේ බොනවා.' },
      { en: 'She works in a bank.', si: 'ඇය බැංකුවක වැඩ කරනවා.' },
      { en: 'Water boils at 100 degrees.', si: 'වතුර අංශක 100 දී තැම්බෙනවා.' },
      { en: "He doesn't eat meat.", si: 'ඔහු මස් කන්නේ නැහැ.' },
      { en: 'Do you play cricket?', si: 'ඔබ ක්‍රිකට් සෙල්ලම් කරනවාද?' },
    ],
    questions: withIds('present-simple', [
      mc(
        'She ___ to school every day.',
        ['go', 'goes', 'going', 'gone'],
        'goes',
        '"She" needs the -es form: goes.',
      ),
      mc(
        'They ___ football on Sundays.',
        ['plays', 'play', 'playing', 'is play'],
        'play',
        '"They" takes the base verb.',
      ),
      fill(
        'He ___ (watch) TV in the evening.',
        ['watches'],
        'Verbs ending in -ch add -es: watches.',
      ),
      mc(
        'Does he ___ English?',
        ['speaks', 'speak', 'speaking', 'spoke'],
        'speak',
        'After "does" use the base verb.',
      ),
      fill('I ___ not like coffee.', ['do'], 'Negative with "I": do not.'),
      tf(
        '"She don\'t like fish" is correct.',
        false,
        'With "she" we use "doesn\'t": "She doesn\'t like fish."',
      ),
      mc(
        'The sun ___ in the east.',
        ['rise', 'rises', 'rising', 'rose'],
        'rises',
        'A fact about "the sun" (it) takes -s: rises.',
      ),
      fill(
        'My mother ___ (cook) dinner every evening.',
        ['cooks'],
        '"My mother" means "she", so add -s: cooks.',
      ),
    ]),
  },
  {
    slug: 'present-continuous',
    order: 4,
    title: 'Present continuous',
    titleSi: 'Present continuous (සිදුවෙමින් පවතින කාලය)',
    level: 'Elementary',
    explanation: [
      'Use the present continuous for actions happening now or around now: "I am reading."',
      'Form: am / is / are + verb-ing.',
      'Negative: am / is / are + not + verb-ing. Question: Am / Is / Are + subject + verb-ing.',
      'Spelling: run → running, make → making, sit → sitting.',
    ],
    sinhalaNotes: [
      'දැන් සිදුවෙමින් පවතින දේ සඳහා යොදයි: "-මින් සිටිනවා". උදා: "මම පොතක් කියවමින් සිටිනවා."',
      'am / is / are + verb-ing. (I am, he/she/it is, you/we/they are).',
      'හැම දවසේම කරන දේට මෙය නොයොදන්න - එයට present simple.',
      'make → making (e අවසානය ඉවත් කරන්න), run → running (අන්තිම අකුර දෙපාරක්).',
    ],
    examples: [
      { en: 'I am reading a book.', si: 'මම පොතක් කියවමින් සිටිනවා.' },
      { en: 'She is cooking now.', si: 'ඇය දැන් උයමින් සිටිනවා.' },
      { en: 'They are playing outside.', si: 'ඔවුන් එළියේ සෙල්ලම් කරමින් සිටිනවා.' },
      { en: 'Are you listening?', si: 'ඔබ සවන් දෙමින් සිටිනවාද?' },
      { en: 'It is not raining.', si: 'දැන් වැස්සක් නැහැ.' },
    ],
    questions: withIds('present-continuous', [
      mc(
        'Look! It ___ raining.',
        ['is', 'are', 'am', 'does'],
        'is',
        '"It" takes "is" with verb-ing.',
      ),
      mc('I ___ studying now.', ['is', 'are', 'am', 'do'], 'am', '"I" takes "am".'),
      fill('She is ___ (run) in the park.', ['running'], 'Double the last letter: run → running.'),
      fill('They ___ watching TV.', ['are'], '"They" takes "are".'),
      tf(
        'We use the present continuous for daily habits.',
        false,
        'Daily habits use the present simple.',
      ),
      mc('He ___ not sleeping.', ['is', 'are', 'am', 'do'], 'is', '"He" takes "is".'),
      mc(
        'What are you ___?',
        ['do', 'does', 'doing', 'done'],
        'doing',
        'After "are you" use verb-ing: doing.',
      ),
      fill(
        'The children are ___ (make) a lot of noise.',
        ['making'],
        'Drop the final e: make → making.',
      ),
    ]),
  },
  {
    slug: 'past-simple',
    order: 5,
    title: 'Past simple',
    titleSi: 'Past simple (අතීත කාලය)',
    level: 'Elementary',
    explanation: [
      'Use the past simple for finished actions at a definite time in the past: "I visited Kandy last year."',
      'Regular verbs add -ed (walked, played). Irregular verbs change form (go → went, eat → ate, buy → bought).',
      "Negative: did not (didn't) + base verb. Question: Did + subject + base verb.",
      'After "did" the verb is always in the base form: "Did you go?" (not "Did you went?").',
    ],
    sinhalaNotes: [
      'අවසන් වූ අතීත සිදුවීම් සඳහා යොදයි: "මම ඊයේ ගියා."',
      'සාමාන්‍ය verbs වලට -ed එක් කරන්න: play → played. සමහර verbs වෙනස් රූපයක් ගනී: go → went.',
      '"did" භාවිතා කරන විට verb එක මුල් රූපයෙන් ලියන්න: "I did not go." (went නොවේ).',
      'අතීතය හඳුනාගැනීමට: yesterday (ඊයේ), last week (පසුගිය සතියේ), ago (කලින්).',
    ],
    examples: [
      { en: 'I visited Kandy last year.', si: 'මම පසුගිය වසරේ මහනුවරට ගියා.' },
      { en: 'She went to school.', si: 'ඇය පාසලට ගියා.' },
      { en: "We didn't see him.", si: 'අපි ඔහුව දැක්කේ නැහැ.' },
      { en: 'Did you eat lunch?', si: 'ඔබ දිවා ආහාරය ගත්තාද?' },
      { en: 'He bought a new phone.', si: 'ඔහු අලුත් දුරකථනයක් මිලදී ගත්තා.' },
    ],
    questions: withIds('past-simple', [
      mc(
        'Yesterday I ___ to the market.',
        ['go', 'goes', 'went', 'gone'],
        'went',
        'The past of "go" is "went".',
      ),
      fill('She ___ (watch) a film last night.', ['watched'], 'Regular verb: add -ed.'),
      mc(
        'Did they ___ the exam?',
        ['pass', 'passed', 'passes', 'passing'],
        'pass',
        'After "did" use the base verb.',
      ),
      fill('We ___ not go to school yesterday.', ['did'], 'Past negative: did not + base verb.'),
      tf('"He goed home" is correct.', false, '"Go" is irregular: "He went home."'),
      mc(
        'I ___ a letter last week.',
        ['write', 'wrote', 'written', 'writes'],
        'wrote',
        'The past of "write" is "wrote".',
      ),
      fill('They ___ (eat) rice for dinner.', ['ate'], 'The past of "eat" is "ate".'),
      mc(
        'She ___ not like the food.',
        ['do', 'does', 'did', 'done'],
        'did',
        'Past negative uses "did not".',
      ),
    ]),
  },
  {
    slug: 'future',
    order: 6,
    title: 'Future: will and going to',
    titleSi: 'Future (will / going to)',
    level: 'Elementary',
    explanation: [
      'Use "will" + base verb for quick decisions, promises and predictions: "I will help you."',
      'Use "be going to" + base verb for plans made before speaking, or when there is evidence now: "Look at those clouds. It is going to rain."',
      "Negative: will not (won't) / am, is, are not going to.",
      'Never put "to" after "will": "I will go" (not "I will to go").',
    ],
    sinhalaNotes: [
      'අනාගත ක්‍රියා සඳහා: "මම උදව් කරන්නම්" = I will help.',
      '"will" = එවේලේම ගන්නා තීරණ, පොරොන්දු, අනුමාන.',
      '"going to" = කලින් සැලසුම් කළ දේ, හෝ දැන් පෙනෙන සාක්ෂි අනුව සිදුවීමට යන දේ. උදා: "වැස්සක් එන්න යනවා."',
      '"will" ට පසු "to" එපා. verb එක මුල් රූපයෙන් ලියන්න.',
    ],
    examples: [
      { en: 'I will help you.', si: 'මම ඔබට උදව් කරන්නම්.' },
      { en: 'It is going to rain.', si: 'වැස්සක් එන්න යනවා.' },
      {
        en: 'We are going to visit Galle next week.',
        si: 'අපි ලබන සතියේ ගාල්ලට යන්න සැලසුම් කරලා තියෙනවා.',
      },
      { en: 'She will not come.', si: 'ඇය එන්නේ නැහැ.' },
      { en: 'Will you call me?', si: 'ඔබ මට කතා කරයිද?' },
    ],
    questions: withIds('future', [
      mc(
        'Look at the clouds! It ___ rain.',
        ['will', 'is going to', 'are going to', 'goes to'],
        'is going to',
        'There is evidence now (clouds), so use "be going to".',
      ),
      mc(
        'I think she ___ pass the exam.',
        ['will', 'is going', 'does', 'did'],
        'will',
        'A prediction can use "will".',
      ),
      fill(
        'We ___ visit Kandy next week. (we have already planned it)',
        ['are going to'],
        'A plan made before speaking: "are going to".',
      ),
      mc(
        'The phone is ringing. I ___ answer it.',
        ['will', 'am going', 'did', 'was'],
        'will',
        'A quick decision at the moment of speaking uses "will".',
      ),
      fill('He ___ not be late. (promise)', ['will'], '"Will not" is the negative of "will".'),
      tf(
        '"I will to go" is correct.',
        false,
        'After "will" we use the base verb without "to": "I will go."',
      ),
      mc(
        'They ___ going to buy a car.',
        ['is', 'am', 'are', 'will'],
        'are',
        '"They" takes "are going to".',
      ),
      fill(
        'Tomorrow I ___ (meet) my friend. Use "will".',
        ['will meet'],
        '"Will" + base verb: will meet.',
      ),
    ]),
  },
  {
    slug: 'present-perfect',
    order: 7,
    title: 'Present perfect',
    titleSi: 'Present perfect (වර්තමාන පූර්ණ කාලය)',
    level: 'Intermediate',
    explanation: [
      'Form: have / has + past participle (done, seen, eaten, been).',
      'Use it for experiences up to now ("I have visited Sigiriya"), and for past actions with a result now ("She has lost her keys").',
      'Use "for" with a length of time (for five years) and "since" with a starting point (since 2015).',
      'Do not use it with a finished time word like "yesterday" or "last year" - use the past simple.',
    ],
    sinhalaNotes: [
      'අතීතයේ සිදු වී දැනට බලපාන දේ, හෝ ජීවිතයේ අත්දැකීම් සඳහා: "මම සීගිරියට ගිහින් තියෙනවා."',
      'have / has + past participle (V3). I/you/we/they → have,  he/she/it → has.',
      '"for" = කාල ප්‍රමාණයක් (for 3 years = වසර 3ක්). "since" = ආරම්භක කාලයක් (since 2020 = 2020 සිට).',
      '"yesterday", "last year" වැනි අවසන් වූ කාල සමඟ මෙය නොයොදන්න. එවිට past simple භාවිතා කරන්න.',
    ],
    examples: [
      { en: 'I have visited Sigiriya.', si: 'මම සීගිරියට ගිහින් තියෙනවා.' },
      { en: 'She has lost her keys.', si: 'ඇයගේ යතුරු නැති වෙලා.' },
      { en: 'They have lived here for ten years.', si: 'ඔවුන් මෙහි වසර දහයක් ජීවත් වෙලා තියෙනවා.' },
      { en: 'Have you finished?', si: 'ඔබ අවසන් කළාද?' },
      { en: "He hasn't eaten yet.", si: 'ඔහු තවම කාලා නැහැ.' },
    ],
    questions: withIds('present-perfect', [
      mc(
        'She ___ finished her homework.',
        ['have', 'has', 'is', 'did'],
        'has',
        '"She" takes "has".',
      ),
      mc(
        'I have lived here ___ 2015.',
        ['for', 'since', 'from', 'ago'],
        'since',
        '"Since" goes with a starting point in time.',
      ),
      mc(
        'We have known him ___ five years.',
        ['for', 'since', 'from', 'at'],
        'for',
        '"For" goes with a length of time.',
      ),
      fill('They have ___ (see) that film.', ['seen'], 'The past participle of "see" is "seen".'),
      tf(
        '"I have seen him yesterday" is correct.',
        false,
        'With "yesterday" use the past simple: "I saw him yesterday."',
      ),
      fill('He ___ not arrived yet.', ['has'], '"He" takes "has".'),
      mc(
        'Have you ever ___ sushi?',
        ['eat', 'ate', 'eaten', 'eating'],
        'eaten',
        'Use the past participle: eaten.',
      ),
      mc(
        '___ you ever been to India?',
        ['Has', 'Have', 'Did', 'Are'],
        'Have',
        '"You" takes "have".',
      ),
    ]),
  },
  {
    slug: 'conditionals',
    order: 8,
    title: 'Conditionals',
    titleSi: 'Conditionals (if වාක්‍ය)',
    level: 'Intermediate',
    explanation: [
      'Zero conditional: if + present simple, present simple. For facts that are always true: "If you heat ice, it melts."',
      'First conditional: if + present simple, will + base verb. For real possibilities in the future: "If it rains, we will stay home."',
      'Second conditional: if + past simple, would + base verb. For unreal or unlikely situations: "If I were rich, I would travel."',
      'Do not use "will" in the "if" part: "If it rains" (not "If it will rain").',
    ],
    sinhalaNotes: [
      '"if" = "නම් / ඔහොත්". උදා: "වැස්සොත් අපි ගෙදර ඉන්නවා."',
      'Zero: සැමවිටම සත්‍ය දේ.  First: සිදුවිය හැකි අනාගත දේ.  Second: සිදුවීමට අසීරු හෝ සිතුවිලි පමණක් වන දේ.',
      '"if" කොටසේ "will" නොයොදන්න: "If it rains, ..." නිවැරදියි.',
      'Second conditional එකේ "I were" යොදනවා (I was නොව) - විශේෂයෙන් ලිඛිත ඉංග්‍රීසියේ.',
    ],
    examples: [
      { en: 'If you heat ice, it melts.', si: 'ඔබ අයිස් රත් කළොත් එය දිය වෙනවා.' },
      { en: 'If it rains, we will stay home.', si: 'වැස්සොත් අපි ගෙදර ඉන්නවා.' },
      { en: 'If I were rich, I would travel the world.', si: 'මම ධනවත් නම්, ලෝකය වටා ගමන් කරනවා.' },
      { en: 'If she studies, she will pass.', si: 'ඇය ඉගෙන ගත්තොත් සමත් වෙයි.' },
    ],
    questions: withIds('conditionals', [
      mc(
        'If it rains tomorrow, we ___ at home.',
        ['stay', 'will stay', 'would stay', 'stayed'],
        'will stay',
        'First conditional: if + present, will + base verb.',
      ),
      mc(
        'If I ___ a bird, I would fly.',
        ['am', 'was', 'were', 'be'],
        'were',
        'Second conditional uses "were" for all persons.',
      ),
      fill(
        'If you heat water to 100°C, it ___ (boil).',
        ['boils'],
        'Zero conditional: present simple in both parts.',
      ),
      mc(
        'If she ___ hard, she will pass.',
        ['study', 'studies', 'studied', 'will study'],
        'studies',
        'Present simple in the "if" part; "she" takes -s.',
      ),
      tf(
        'In the first conditional we use "will" after "if".',
        false,
        'Use the present simple after "if": "If it rains, ..."',
      ),
      mc(
        'If I had money, I ___ buy a car.',
        ['will', 'would', 'am', 'did'],
        'would',
        'Second conditional: if + past, would + base verb.',
      ),
      fill('If he ___ (come), I will tell him.', ['comes'], 'Present simple in the "if" part.'),
      mc(
        'If you mix red and blue, you ___ purple.',
        ['get', 'would got', 'getting', 'will to get'],
        'get',
        'Zero conditional (a fact): present simple.',
      ),
    ]),
  },
  {
    slug: 'passive-voice',
    order: 9,
    title: 'Passive voice',
    titleSi: 'Passive voice (කර්මවාච්‍ය)',
    level: 'Intermediate',
    explanation: [
      'Passive form: be + past participle. The object of the active sentence becomes the subject: "The book was written by him."',
      'Use the passive when the doer is unknown, unimportant, or you want to focus on the action: "English is spoken here."',
      'Tense is shown by "be": is / are (present), was / were (past), will be (future).',
      'Use "by" + agent only when it adds useful information.',
    ],
    sinhalaNotes: [
      'කර්තෘට වඩා ක්‍රියාවට / ක්‍රියාවට ලක් වූ දේට අවධානය යොමු කරන විට යොදයි: "පොත ලියන ලදී."',
      'සිංහලයේ "-නු ලැබේ / -න ලදී" වැනි රූපවලට සමානයි.',
      'be (is/are/was/were/will be) + past participle (V3). කාලය තීරණය වන්නේ "be" මගිනි.',
      'කර්තෘ කවුදැයි දැන ගැනීම අවශ්‍ය නම් පමණක් "by ..." එක් කරන්න.',
    ],
    examples: [
      { en: 'The book was written by him.', si: 'පොත ඔහු විසින් ලියන ලදී.' },
      { en: 'English is spoken here.', si: 'මෙහි ඉංග්‍රීසි කතා කරනු ලැබේ.' },
      { en: 'The cake was eaten.', si: 'කේක් එක කාලා ඉවරයි.' },
      { en: 'The houses were built in 1990.', si: 'ගෙවල් 1990 දී ඉදි කරන ලදී.' },
      { en: 'A new road will be built.', si: 'නව මාර්ගයක් ඉදි කරනු ඇත.' },
    ],
    questions: withIds('passive-voice', [
      mc(
        'The letter ___ by my sister.',
        ['wrote', 'was written', 'is writing', 'has wrote'],
        'was written',
        'Past passive: was + past participle.',
      ),
      mc(
        'English ___ in many countries.',
        ['speaks', 'is spoken', 'spoke', 'speaking'],
        'is spoken',
        'Present passive: is + past participle.',
      ),
      fill(
        'The windows ___ (break) yesterday. Use the passive.',
        ['were broken'],
        'Past passive plural: were + broken.',
      ),
      mc(
        'The cake ___ by Nimal.',
        ['baked', 'was baked', 'bakes', 'is bake'],
        'was baked',
        'Past passive: was + baked.',
      ),
      tf(
        '"The car was stole" is correct.',
        false,
        'Use the past participle "stolen": "The car was stolen."',
      ),
      fill(
        'Rice ___ (grow) in Sri Lanka. Use the present passive.',
        ['is grown'],
        'Present passive singular: is + grown.',
      ),
      mc(
        'These houses ___ built in 1990.',
        ['was', 'were', 'are', 'is'],
        'were',
        'Plural past passive: were + built.',
      ),
      mc(
        'A new bridge will ___ next year.',
        ['build', 'built', 'be built', 'being built'],
        'be built',
        'Future passive: will be + past participle.',
      ),
    ]),
  },
];
