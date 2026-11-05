/**
 * Seed dictionary. One entry per line: english|sinhala|partOfSpeech|level|example
 * Stored as UTF-8 so Sinhala renders correctly.
 */
const RAW = `
apple|ඇපල්|noun|A1|I eat an apple every day.
book|පොත|noun|A1|This book is very interesting.
water|වතුර|noun|A1|Please give me a glass of water.
house|නිවස|noun|A1|Their house is near the school.
school|පාසල|noun|A1|The children walk to school.
teacher|ගුරුවරයා|noun|A1|My teacher is very kind.
student|ශිෂ්‍යයා|noun|A1|Every student has a book.
friend|මිතුරා|noun|A1|She is my best friend.
family|පවුල|noun|A1|My family lives in Kandy.
mother|අම්මා|noun|A1|My mother cooks very well.
father|තාත්තා|noun|A1|My father works in an office.
brother|සහෝදරයා|noun|A1|My brother plays cricket.
sister|සහෝදරිය|noun|A1|My sister likes music.
child|දරුවා|noun|A1|The child is sleeping.
man|පිරිමියා|noun|A1|The man is waiting for the bus.
woman|ගැහැණිය|noun|A1|The woman is a doctor.
boy|පිරිමි ළමයා|noun|A1|The boy is playing outside.
girl|ගැහැණු ළමයා|noun|A1|The girl is reading a book.
dog|බල්ලා|noun|A1|The dog barks at night.
cat|පූසා|noun|A1|The cat is on the chair.
bird|කුරුල්ලා|noun|A1|A bird is singing in the tree.
fish|මාළුවා|noun|A1|We bought fresh fish today.
tree|ගස|noun|A1|There is a big tree in the garden.
flower|මල|noun|A1|She gave me a red flower.
sun|සූර්යයා|noun|A1|The sun is very hot today.
moon|සඳ|noun|A1|The moon is bright tonight.
star|තාරකාව|noun|A2|I can see a star in the sky.
rain|වැස්ස|noun|A1|The rain started in the morning.
day|දවස|noun|A1|Today is a good day.
night|රාත්‍රිය|noun|A1|I study at night.
morning|උදෑසන|noun|A1|I drink tea in the morning.
evening|සවස|noun|A1|We walk by the sea in the evening.
food|ආහාර|noun|A1|The food at home is delicious.
rice|බත්|noun|A1|We eat rice and curry for lunch.
bread|පාන්|noun|A1|I bought bread from the shop.
milk|කිරි|noun|A1|The baby drinks milk.
tea|තේ|noun|A1|Ceylon tea is famous.
egg|බිත්තරය|noun|A1|I had an egg for breakfast.
fruit|පළතුරු|noun|A1|Fruit is good for health.
vegetable|එළවළු|noun|A2|Eat more vegetables every day.
table|මේසය|noun|A1|The book is on the table.
chair|පුටුව|noun|A1|Please sit on the chair.
door|දොර|noun|A1|Close the door, please.
window|ජනේලය|noun|A1|Open the window.
room|කාමරය|noun|A1|My room is small.
bed|ඇඳ|noun|A1|The bed is very comfortable.
car|මෝටර් රථය|noun|A1|His car is new.
bus|බස් රථය|noun|A1|I go to work by bus.
road|පාර|noun|A1|The road is busy in the morning.
city|නගරය|noun|A2|Colombo is a big city.
village|ගම|noun|A2|My grandmother lives in a village.
country|රට|noun|A2|Sri Lanka is a beautiful country.
name|නම|noun|A1|What is your name?
number|අංකය|noun|A1|Write your phone number here.
colour|වර්ණය|noun|A1|What is your favourite colour?
red|රතු|adjective|A1|She wore a red dress.
blue|නිල්|adjective|A1|The sky is blue.
green|කොළ|adjective|A1|The leaves are green.
yellow|කහ|adjective|A1|Bananas are yellow.
white|සුදු|adjective|A1|He has a white shirt.
black|කළු|adjective|A1|The black cat is sleeping.
big|විශාල|adjective|A1|They live in a big house.
small|කුඩා|adjective|A1|I have a small bag.
good|හොඳ|adjective|A1|This is a good idea.
bad|නරක|adjective|A1|The weather is bad today.
new|අලුත්|adjective|A1|I bought a new phone.
old|පැරණි|adjective|A1|This is an old temple.
hot|උණුසුම්|adjective|A1|The tea is hot.
cold|සීතල|adjective|A1|The water is cold.
happy|සතුටු|adjective|A1|I am happy to see you.
sad|දුක්|adjective|A1|He looks sad today.
beautiful|ලස්සන|adjective|A2|What a beautiful garden!
easy|පහසු|adjective|A2|The test was easy.
difficult|අමාරු|adjective|A2|English grammar can be difficult.
fast|වේගවත්|adjective|A2|He is a fast runner.
slow|මන්දගාමී|adjective|A2|The bus is very slow.
go|යනවා|verb|A1|I go to school every day.
come|එනවා|verb|A1|Please come here.
eat|කනවා|verb|A1|We eat dinner at seven.
drink|බොනවා|verb|A1|I drink water after exercise.
sleep|නිදාගන්නවා|verb|A1|The baby sleeps early.
walk|ඇවිදිනවා|verb|A1|I walk to the shop.
run|දුවනවා|verb|A1|The children run in the park.
read|කියවනවා|verb|A1|She reads a story every night.
write|ලියනවා|verb|A1|Write your name here.
speak|කතා කරනවා|verb|A1|Can you speak English?
listen|සවන් දෙනවා|verb|A1|Listen to the teacher.
see|දකිනවා|verb|A1|I can see a bird.
look|බලනවා|verb|A1|Look at the board.
learn|ඉගෙන ගන්නවා|verb|A1|I learn English every day.
teach|උගන්වනවා|verb|A2|She teaches maths.
play|සෙල්ලම් කරනවා|verb|A1|They play cricket on Sundays.
work|වැඩ කරනවා|verb|A1|He works in a bank.
open|විවෘත කරනවා|verb|A1|Open your books.
close|වසනවා|verb|A1|Please close the window.
give|දෙනවා|verb|A1|Give me the pen, please.
take|ගන්නවා|verb|A1|Take an umbrella with you.
buy|මිලදී ගන්නවා|verb|A1|I want to buy a book.
sell|විකුණනවා|verb|A2|They sell fruit at the market.
love|ආදරය කරනවා|verb|A1|I love my family.
like|කැමති වෙනවා|verb|A1|I like mangoes.
want|ඕනෑ වෙනවා|verb|A1|I want some water.
need|අවශ්‍ය වෙනවා|verb|A2|We need more time.
help|උදව් කරනවා|verb|A1|Can you help me?
know|දන්නවා|verb|A1|I know the answer.
think|සිතනවා|verb|A2|I think it will rain.
understand|තේරුම් ගන්නවා|verb|A2|I do not understand this word.
ask|අහනවා|verb|A1|Ask the teacher a question.
answer|පිළිතුරු දෙනවා|verb|A2|Please answer the question.
live|ජීවත් වෙනවා|verb|A1|I live in Galle.
make|හදනවා|verb|A1|She makes delicious cakes.
cook|උයනවා|verb|A2|My mother cooks every morning.
wash|සෝදනවා|verb|A2|Wash your hands before eating.
sit|වාඩි වෙනවා|verb|A1|Please sit down.
stand|සිටගන්නවා|verb|A2|Stand up, please.
wait|බලා සිටිනවා|verb|A2|Wait for me here.
start|පටන් ගන්නවා|verb|A2|The class starts at eight.
finish|අවසන් කරනවා|verb|A2|I finish work at five.
call|අමතනවා|verb|A2|I will call you tonight.
pay|ගෙවනවා|verb|A2|I pay the bill every month.
sing|ගායනා කරනවා|verb|A2|She sings beautifully.
dance|නටනවා|verb|A2|They dance at the festival.
swim|පීනනවා|verb|A2|I can swim in the sea.
travel|ගමන් කරනවා|verb|A2|We travel by train.
visit|බැලීමට යනවා|verb|A2|We visit our grandparents on Sundays.
forget|අමතක කරනවා|verb|A2|Do not forget your keys.
remember|මතක තබා ගන්නවා|verb|A2|I remember her name.
try|උත්සාහ කරනවා|verb|A2|Please try again.
time|කාලය|noun|A1|What time is it?
year|වසර|noun|A1|This year I will study hard.
month|මාසය|noun|A1|There are twelve months in a year.
week|සතිය|noun|A1|I go swimming twice a week.
today|අද|adverb|A1|Today is Monday.
tomorrow|හෙට|adverb|A1|See you tomorrow.
yesterday|ඊයේ|adverb|A1|I met him yesterday.
now|දැන්|adverb|A1|I am busy now.
always|සැමවිටම|adverb|A2|She always arrives early.
never|කිසිදා නැත|adverb|A2|I never eat meat.
sometimes|සමහර විට|adverb|A2|Sometimes we walk to school.
often|නිතර|adverb|A2|They often visit the temple.
here|මෙතන|adverb|A1|Come here.
there|එතන|adverb|A1|The book is over there.
and|සහ|conjunction|A1|I like tea and biscuits.
but|නමුත්|conjunction|A1|I like tea but not coffee.
because|නිසා|conjunction|A2|I stayed home because it rained.
if|නම්|conjunction|A2|If it rains, we will stay inside.
or|හෝ|conjunction|A1|Do you want tea or coffee?
with|සමඟ|preposition|A1|I live with my parents.
without|නොමැතිව|preposition|A2|He left without a bag.
in|තුළ|preposition|A1|The book is in the bag.
on|මත|preposition|A1|The cup is on the table.
under|යට|preposition|A1|The cat is under the bed.
between|අතර|preposition|A2|The shop is between the bank and the school.
before|පෙර|preposition|A2|Wash your hands before eating.
after|පසු|preposition|A2|We play after school.
very|ඉතා|adverb|A1|The food is very good.
also|තවද|adverb|A2|She also speaks French.
money|මුදල්|noun|A1|I do not have enough money.
shop|සාප්පුව|noun|A1|The shop opens at nine.
market|වෙළඳපොළ|noun|A2|We buy vegetables at the market.
hospital|රෝහල|noun|A2|He works at the hospital.
doctor|වෛද්‍යවරයා|noun|A1|The doctor is very kind.
police|පොලිසිය|noun|A2|Call the police.
job|රැකියාව|noun|A2|She has a new job.
office|කාර්යාලය|noun|A2|My office is in Colombo.
computer|පරිගණකය|noun|A2|I use a computer at work.
phone|දුරකථනය|noun|A1|My phone is on the table.
language|භාෂාව|noun|A2|Sinhala is my first language.
word|වචනය|noun|A1|What does this word mean?
sentence|වාක්‍යය|noun|A2|Write a sentence with this word.
question|ප්‍රශ්නය|noun|A1|I have a question.
story|කතාව|noun|A2|Tell me a story.
song|ගීතය|noun|A1|This song is very popular.
game|ක්‍රීඩාව|noun|A1|Cricket is my favourite game.
picture|පින්තූරය|noun|A1|She drew a picture.
important|වැදගත්|adjective|B1|Education is important.
interesting|රසවත්|adjective|B1|The film was very interesting.
dangerous|භයානක|adjective|B1|The river is dangerous in the rainy season.
expensive|මිල අධික|adjective|B1|This watch is too expensive.
cheap|ලාභ|adjective|B1|Vegetables are cheap today.
clean|පිරිසිදු|adjective|A2|Keep your room clean.
dirty|අපිරිසිදු|adjective|A2|The floor is dirty.
strong|ශක්තිමත්|adjective|B1|He is strong and healthy.
weak|දුර්වල|adjective|B1|I feel weak after being ill.
rich|පොහොසත්|adjective|B1|The rich man helped the poor.
poor|දිළිඳු|adjective|B1|They were poor but happy.
young|තරුණ|adjective|A2|She is a young teacher.
tired|වෙහෙසට පත්|adjective|A2|I am tired after work.
hungry|බඩගිනි|adjective|A2|The children are hungry.
thirsty|පිපාසිත|adjective|A2|I am thirsty. May I have water?
angry|කෝපයෙන්|adjective|B1|He was angry about the delay.
afraid|බියෙන්|adjective|B1|She is afraid of dogs.
healthy|සෞඛ්‍ය සම්පන්න|adjective|B1|Eat healthy food.
weather|කාලගුණය|noun|B1|The weather is nice today.
health|සෞඛ්‍යය|noun|B1|Health is more important than money.
education|අධ්‍යාපනය|noun|B1|Education is free in Sri Lanka.
knowledge|දැනුම|noun|B1|Knowledge is power.
experience|අත්දැකීම|noun|B1|I have a lot of work experience.
future|අනාගතය|noun|B1|I want a bright future.
past|අතීතය|noun|B1|Do not forget the past.
present|වර්තමානය|noun|B1|Live in the present.
idea|අදහස|noun|B1|That is a great idea.
problem|ගැටලුව|noun|B1|We have a problem with the car.
solution|විසඳුම|noun|B2|We need to find a solution.
reason|හේතුව|noun|B1|What is the reason for the delay?
result|ප්‍රතිඵලය|noun|B1|The exam results are out.
choice|තේරීම|noun|B1|You have a choice.
decision|තීරණය|noun|B1|It was a difficult decision.
opinion|මතය|noun|B2|In my opinion, it is a good plan.
environment|පරිසරය|noun|B2|We must protect the environment.
government|රජය|noun|B2|The government built a new road.
society|සමාජය|noun|B2|Society needs good teachers.
culture|සංස්කෘතිය|noun|B2|Sri Lankan culture is rich and old.
tradition|සම්ප්‍රදාය|noun|B2|It is a family tradition.
history|ඉතිහාසය|noun|B1|I enjoy studying history.
science|විද්‍යාව|noun|B1|Science is my favourite subject.
technology|තාක්ෂණය|noun|B2|Technology changes our lives.
economy|ආර්ථිකය|noun|B2|The economy is growing slowly.
develop|සංවර්ධනය කරනවා|verb|B1|The country is developing fast.
improve|වැඩිදියුණු කරනවා|verb|B1|I want to improve my English.
achieve|ළඟා කරගන්නවා|verb|B2|She achieved her goal.
suggest|යෝජනා කරනවා|verb|B1|I suggest we leave early.
explain|පැහැදිලි කරනවා|verb|B1|Please explain this rule.
describe|විස්තර කරනවා|verb|B1|Describe your house.
compare|සසඳනවා|verb|B1|Compare these two pictures.
decide|තීරණය කරනවා|verb|B1|We decided to go by train.
prefer|වඩා කැමති වෙනවා|verb|B1|I prefer tea to coffee.
believe|විශ්වාස කරනවා|verb|B1|I believe you.
agree|එකඟ වෙනවා|verb|B1|I agree with you.
disagree|එකඟ නොවෙනවා|verb|B1|I disagree with that idea.
enjoy|විනෝද වෙනවා|verb|B1|I enjoy reading.
avoid|මග හරිනවා|verb|B1|Avoid fast food.
allow|අවසර දෙනවා|verb|B1|They do not allow phones here.
protect|ආරක්ෂා කරනවා|verb|B1|Protect your eyes from the sun.
receive|ලබා ගන්නවා|verb|B1|I received your letter.
provide|සපයනවා|verb|B2|The school provides books.
consider|සලකා බලනවා|verb|B2|Consider all the options.
continue|දිගටම කරගෙන යනවා|verb|B1|Please continue reading.
manage|කළමනාකරණය කරනවා|verb|B2|She manages a small shop.
prepare|සූදානම් කරනවා|verb|B1|I prepare dinner at six.
`;

export interface DictionarySeed {
  english: string;
  sinhala: string;
  partOfSpeech: string;
  level: string;
  example: string;
}

export const dictionarySeed: DictionarySeed[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [english, sinhala, partOfSpeech, level, example] = line.split('|');
    return { english, sinhala, partOfSpeech, level, example };
  });
