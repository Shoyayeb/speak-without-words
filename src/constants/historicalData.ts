export interface LearningModule {
  id: string;
  title: string;
  era: string;
  year?: string;
  description: string;
  fullContent: string;
  icon: string;
  imageUrl?: string;
  hasGame: boolean;
  gameType?: 'morse' | 'semaphore' | 'cipher' | 'puzzle';
  color: string;
}

export const HISTORICAL_CODES: LearningModule[] = [
  {
    id: 'smoke-signals',
    title: 'Smoke Signals',
    era: 'Ancient',
    year: '1800 BC',
    icon: '🔥',
    color: '#E17055',
    description: 'One of humanity\'s earliest forms of long-distance communication.',
    fullContent: `Smoke signals were used by ancient civilizations across the globe, from the Chinese along the Great Wall to Native American tribes across the plains.

**How it worked:**
• Different patterns of smoke puffs conveyed specific meanings
• Wet grass or leaves created thick, visible smoke
• Messages could travel up to 500 miles in relay chains

**Famous uses:**
• The Great Wall of China used smoke signals to warn of enemy attacks
• Native Americans communicated across vast distances
• Ancient Greeks signaled the fall of Troy

**The system:**
• One puff: Attention / Look here
• Two puffs: All is well
• Three puffs: Danger / Come quickly
• Continuous smoke: Call for help`,
    hasGame: false,
  },
  {
    id: 'morse-code',
    title: 'Morse Code',
    era: '1840s',
    year: '1844',
    icon: '📻',
    color: '#74B9FF',
    description: 'Dots and dashes that revolutionized global communication.',
    fullContent: `Developed by Samuel Morse and Alfred Vail, Morse Code transformed how the world communicated.

**How it works:**
• Letters encoded as dots (short) and dashes (long)
• Standard timing: dash = 3 dots, space between letters = 3 dots
• International Morse Code adopted worldwide

**Key codes:**
• SOS: ••• --- ••• (Save Our Souls)
• A: •-  B: -•••  C: -•-•
• Numbers 0-9 have their own patterns

**Historic moments:**
• First message: "What hath God wrought" (1844)
• Titanic's distress call (1912)
• Used in both World Wars for military communication

**Still used today:**
• Aviation and maritime safety
• Amateur radio operators
• Accessibility communication`,
    hasGame: true,
    gameType: 'morse',
  },
  {
    id: 'semaphore',
    title: 'Semaphore Flags',
    era: '1790s',
    year: '1792',
    icon: '🚩',
    color: '#FDCB6E',
    description: 'Flag positions that spelled out messages across distances.',
    fullContent: `The semaphore system used flag positions to represent letters and numbers, enabling visual communication over long distances.

**Origins:**
• Invented by Claude Chappe in France during the Revolution
• Towers built across France for rapid military communication
• Could transmit a message 150 miles in just 15 minutes

**How it works:**
• Two flags held in specific positions represent letters
• 8 positions per flag = 64 combinations
• Read from left to right, like text

**Naval semaphore:**
• Still taught in navies worldwide
• Used for ship-to-ship communication
• Works when radio silence is required

**The alphabet:**
• Positions based on a clock face
• Each letter has a unique two-flag combination
• Numbers indicated by a "numerals" signal first`,
    hasGame: true,
    gameType: 'semaphore',
  },
  {
    id: 'invisible-ink',
    title: 'Invisible Ink',
    era: 'Ancient - WWII',
    year: '400 BC+',
    icon: '✉️',
    color: '#9171FF',
    description: 'Secret messages hidden in plain sight.',
    fullContent: `Invisible ink has been used for millennia to hide messages within seemingly ordinary letters.

**Ancient methods:**
• Lemon juice (reveals when heated)
• Milk (turns brown with heat)
• Onion juice, urine, vinegar

**Revolutionary War:**
• George Washington's spy network used "sympathetic stain"
• Required special chemical to reveal
• Messages hidden between lines of ordinary letters

**WWII innovations:**
• German spies used sophisticated chemical inks
• Allies developed detection methods using UV light
• Double-agent operations involved invisible ink exchanges

**How to detect:**
• Heat (candle or iron)
• UV/black light
• Chemical reagents
• Iodine vapor

**Modern uses:**
• Security watermarks
• Anti-counterfeiting measures
• Escape room puzzles`,
    hasGame: false,
  },
  {
    id: 'carrier-pigeons',
    title: 'Carrier Pigeons',
    era: '500 BC+',
    year: '500 BC',
    icon: '🐦',
    color: '#00B894',
    description: 'Feathered messengers that delivered secrets through the sky.',
    fullContent: `Homing pigeons served as reliable messengers for over 2,500 years, carrying crucial information across enemy lines.

**Natural ability:**
• Pigeons can find home from 1,000+ miles away
• Navigate using Earth's magnetic field and sun position
• Speed: 50-60 mph sustained flight

**Military history:**
• Ancient Persians and Romans used pigeon post
• Used extensively in WWI and WWII
• Cher Ami: Famous WWI pigeon who saved 194 soldiers

**Message delivery:**
• Tiny capsules attached to legs
• Microfilm reduced message size
• Messages often encrypted as backup security

**Cher Ami's story:**
• Delivered message despite being shot
• Lost a leg but survived
• Awarded the Croix de Guerre medal

**Modern relevance:**
• Still used in remote areas
• Pigeon racing is a popular sport
• Studied for navigation research`,
    hasGame: false,
  },
  {
    id: 'knitting-codes',
    title: 'Knitting Codes',
    era: 'WWII',
    year: '1940s',
    icon: '🧶',
    color: '#E84393',
    description: 'Resistance fighters who knitted secrets into scarves.',
    fullContent: `During WWII, resistance fighters embedded coded messages in knitting patterns, hiding intelligence in plain sight.

**The Belgian Resistance:**
• Elderly women sat near train stations, knitting
• Noted troop movements in their stitches
• "Knit one, purl two" became a code

**How codes were hidden:**
• Knit stitch = dash, Purl stitch = dot (Morse)
• Dropped stitches marked key information
• Pattern changes indicated dates or locations

**Why it worked:**
• Knitting was common and unsuspicious
• Patterns looked like ordinary decoration
• Could be unraveled to destroy evidence

**Famous knitters:**
• Phyllis Latour: British spy who transmitted 135 messages
• Belgian resistance networks
• French underground railroad guides

**The craft of spycraft:**
• Handmade items passed between agents
• Socks, scarves, and sweaters carried secrets
• A perfect example of hiding in plain sight`,
    hasGame: false,
  },
  {
    id: 'caesar-cipher',
    title: 'Caesar Cipher',
    era: 'Ancient Rome',
    year: '58 BC',
    icon: '🏛️',
    color: '#00CEC9',
    description: 'Julius Caesar\'s secret military encryption.',
    fullContent: `One of the earliest and most famous encryption methods, used by Julius Caesar to protect military communications.

**How it works:**
• Shift each letter by a fixed number
• Caesar used a shift of 3
• A becomes D, B becomes E, etc.

**Example:**
• Plain: "ATTACK AT DAWN"
• Shift 3: "DWWDFN DW GDZQ"
• Only someone knowing the shift could decode

**Breaking the cipher:**
• Only 25 possible shifts to try
• Letter frequency analysis
• Common patterns (THE, AND, IS)

**Historical use:**
• Protected Roman military orders
• Used for centuries in various forms
• Foundation of modern cryptography

**Legacy:**
• ROT13 (shift of 13) used online
• Teaches fundamental encryption concepts
• Starting point for complex ciphers`,
    hasGame: true,
    gameType: 'cipher',
  },
  {
    id: 'hand-signals',
    title: 'Military Hand Signals',
    era: 'Modern Era',
    year: '1900s+',
    icon: '✋',
    color: '#6C5CE7',
    description: 'Silent commands used by tactical teams worldwide.',
    fullContent: `Military and police forces developed standardized hand signals for silent communication in tactical situations.

**Why silent communication:**
• Sound travels and alerts enemies
• Radio silence may be required
• Quick, visual confirmation

**Common signals:**
• Closed fist: Stop/Freeze
• Point: Go that direction
• Flat hand down: Get down
• Throat cut: Enemy/Danger
• Thumbs up: Ready/Okay

**SWAT team signals:**
• More complex vocabulary
• Cover entries and formations
• Team coordination without sound

**Sports adoption:**
• Baseball signs from catcher to pitcher
• Football play calls
• Basketball coach instructions

**In our daily lives:**
• Traffic police directing cars
• Scuba divers underwater
• Construction site workers`,
    hasGame: false,
  },
];
