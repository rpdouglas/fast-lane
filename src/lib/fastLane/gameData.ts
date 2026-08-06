// src/lib/fastLane/gameData.ts
// Content for "One Day at a Time" — the 11-location ROSC board (§3 of the
// master design doc) and the Crossroads event pool (§4.4). Narrative content
// is written toward the four personas in docs/Design/fastlane_personas.md
// (Marcus, Jamie, Renee, Dale) and checked against the Ringer/Punchline/
// Non-Manipulation tests described there: no shame-coded language, no
// MAT-vs-abstinence-vs-secular hierarchy, no choice flagged as objectively
// correct.
import type { EventDef, LocationDef, RelationshipState, RelationshipKey } from './types';

export const LOCATIONS: LocationDef[] = [
  {
    id: 'home',
    name: 'Home',
    dimension: 'home',
    availableBlocks: ['morning', 'afternoon', 'evening'],
    eventWeight: 3,
    activities: [
      {
        id: 'homeChores',
        label: 'Catch up on chores',
        statDeltas: { stability: 2 },
        diminishingReturns: { cooldownDays: 2, decayFactor: 0.6 },
        narrativeVariants: [
          'You get the dishes done and the mail sorted. Small, but it counts.',
          'The apartment looks like somebody lives here on purpose. That matters more than it sounds like it should.',
        ],
      },
      {
        id: 'homeCookRealMeal',
        label: 'Cook a real meal',
        statDeltas: { wellness: 2, stability: 1 },
        narrativeVariants: [
          "You actually cook instead of eating standing over the sink. It's a small thing that doesn't feel small.",
          'Something with vegetables in it, for once. You eat at the table like a person with a table.',
        ],
      },
      {
        id: 'homeBudgetCheckIn',
        label: 'Sit down with the budget',
        statDeltas: { stability: 2, direction: 1 },
        narrativeVariants: [
          "You lay out what's coming in and what's going out. It's not fun, but it's not scary once it's on paper.",
          'You move some numbers around and the month makes a little more sense than it did an hour ago.',
        ],
      },
    ],
  },
  {
    id: 'workplace',
    name: 'Workplace',
    dimension: 'purpose',
    availableBlocks: ['morning', 'afternoon'],
    eventWeight: 6,
    activities: [
      {
        id: 'workShift',
        label: 'Work your shift',
        moneyGain: 60,
        statDeltas: { direction: 2, wellness: -1 },
        diminishingReturns: { cooldownDays: 2, decayFactor: 0.7 },
        narrativeVariants: [
          'The shift is the shift — clock in, keep your head down, clock out. Nothing dramatic, which is its own kind of win.',
          'You get through it. Your manager nods at you on the way out, which is about as much praise as this job hands out.',
        ],
      },
      {
        id: 'workOvertime',
        label: 'Pick up an extra shift',
        moneyGain: 100,
        statDeltas: { direction: 1, stability: 1, wellness: -2 },
        narrativeVariants: [
          "The overtime pay is real, and so is how wiped out you are by the end of it.",
          'You say yes because the money helps. You feel it in your shoulders by hour six.',
        ],
      },
      {
        id: 'workAskFeedback',
        label: 'Ask your supervisor how you’re doing',
        statDeltas: { direction: 2 },
        narrativeVariants: [
          "\"Honestly? You've been solid,\" she says, like it's not a big deal. It kind of is, to you.",
          "Your supervisor gives you a straight, unremarkable answer. No complaints. You'll take unremarkable.",
        ],
      },
    ],
  },
  {
    id: 'employmentCenter',
    name: 'Employment Center',
    dimension: 'purpose',
    availableBlocks: ['morning', 'afternoon'],
    eventWeight: 4,
    activities: [
      {
        id: 'jobBrowsePostings',
        label: 'Browse job postings',
        statDeltas: { direction: 1 },
        narrativeVariants: [
          'You scroll through listings that mostly want experience you don’t have yet. A couple look worth a shot.',
          'Half these postings are already filled. You bookmark the two that aren’t.',
        ],
      },
      {
        id: 'jobCounselorMeeting',
        label: 'Meet with a career counselor',
        statDeltas: { direction: 2 },
        moneyCost: 5,
        narrativeVariants: [
          'She asks about the gap in your work history like it’s a logistics problem, not a confession booth. You appreciate that.',
          'The counselor helps you frame the last year without either hiding it or over-explaining it.',
        ],
      },
      {
        id: 'jobUpdateResume',
        label: 'Update your resume',
        statDeltas: { direction: 1 },
        diminishingReturns: { cooldownDays: 4, decayFactor: 0.5 },
        narrativeVariants: [
          'You fill in a line you’ve been avoiding. It reads better than you expected.',
          'You tighten up the wording and print a clean copy. Small, unglamorous, done.',
        ],
      },
    ],
  },
  {
    id: 'meetingHall',
    name: 'Meeting Hall',
    dimension: 'community',
    availableBlocks: ['evening'],
    eventWeight: 7,
    activities: [
      {
        id: 'meetingListen',
        label: 'Show up and just listen',
        statDeltas: { connection: 2 },
        narrativeVariants: [
          'You don’t say anything tonight. You don’t have to. Sitting in the room counts.',
          'Someone else’s story sounds a lot like yours from a few months back. You nod along in your seat.',
        ],
      },
      {
        id: 'meetingShare',
        label: 'Share when it comes around to you',
        statDeltas: { connection: 3, wellness: 1 },
        narrativeVariants: [
          'You say the actual true thing instead of the easy version. Your voice shakes a little. Nobody minds.',
          'It’s not eloquent, but it’s honest, and a couple people catch your eye afterward like it landed.',
        ],
      },
      {
        id: 'meetingCoffeeAfter',
        label: 'Stick around for coffee after',
        statDeltas: { connection: 2 },
        narrativeVariants: [
          'Bad coffee, decent conversation. Someone gets your number for the group text.',
          'You end up laughing about something completely unrelated to recovery. It’s a relief, honestly.',
        ],
      },
    ],
  },
  {
    id: 'sponsorHouse',
    name: "Sponsor's House",
    dimension: 'community',
    availableBlocks: ['evening'],
    eventWeight: 6,
    activities: [
      {
        id: 'sponsorPhoneCheckIn',
        label: 'Check in by phone',
        statDeltas: { connection: 1 },
        narrativeVariants: [
          '"Just checking you’re still upright," they say. You are. You tell them so.',
          'It’s a short call. Sometimes short is exactly what the day needed.',
        ],
      },
      {
        id: 'sponsorRealConversation',
        label: 'Sit down for a real conversation',
        statDeltas: { connection: 2, wellness: 1 },
        diminishingReturns: { cooldownDays: 3, decayFactor: 0.7 },
        narrativeVariants: [
          'You actually get into it — not the highlight reel, the real week. They listen without fixing it for you.',
          'You talk longer than you meant to. It helps more than you expected it to.',
        ],
      },
      {
        id: 'sponsorHardMoment',
        label: 'Ask them to help you think through something hard',
        statDeltas: { connection: 2, direction: 1 },
        narrativeVariants: [
          'They don’t hand you an answer. They ask you three questions that get you most of the way there yourself.',
          '"What would you tell someone else in this spot?" they ask. Annoyingly, it works.',
        ],
      },
    ],
  },
  {
    id: 'serviceCenter',
    name: 'Service Center',
    dimension: 'community',
    secondaryDimension: 'purpose',
    availableBlocks: ['morning', 'afternoon'],
    eventWeight: 4,
    activities: [
      {
        id: 'serviceVolunteerShift',
        label: 'Volunteer a shift',
        statDeltas: { connection: 2, direction: 1 },
        narrativeVariants: [
          'You spend the shift sorting donated coats. Nobody’s keeping score, which is sort of the point.',
          'It’s unglamorous work and it doesn’t pay. You leave feeling more like yourself than you did this morning.',
        ],
      },
      {
        id: 'serviceSetUpChairs',
        label: 'Set up chairs before a meeting',
        statDeltas: { connection: 1 },
        narrativeVariants: [
          'You get there early to unstack chairs with a guy who’s been doing it for eleven years.',
          'It takes fifteen minutes. Somehow it makes the room feel like it’s partly yours.',
        ],
      },
      {
        id: 'serviceMentorNewcomer',
        label: 'Talk to someone newer than you',
        statDeltas: { connection: 2, direction: 1, wellness: 1 },
        narrativeVariants: [
          'She’s three weeks in and scared it won’t stick. You tell her the truth: it gets more livable, not perfect.',
          'You don’t have all the answers, but you’re further down the road than he is, and that turns out to be enough tonight.',
        ],
      },
    ],
  },
  {
    id: 'healthClinic',
    name: 'Health Clinic',
    dimension: 'health',
    availableBlocks: ['morning', 'afternoon'],
    eventWeight: 5,
    activities: [
      {
        id: 'clinicAppointment',
        label: 'Go to your scheduled appointment',
        statDeltas: { wellness: 3 },
        moneyCost: 20,
        narrativeVariants: [
          'Routine bloodwork, routine questions. Nothing alarming. You almost forgot how good "routine" can feel.',
          'The nurse practitioner asks how you’re actually sleeping. You tell her the truth, and she adjusts something small.',
        ],
      },
      {
        id: 'clinicTherapySession',
        label: 'Talk to a therapist',
        statDeltas: { wellness: 3, direction: 1 },
        moneyCost: 15,
        diminishingReturns: { cooldownDays: 3, decayFactor: 0.8 },
        narrativeVariants: [
          'You spend most of the session on something that isn’t about substances at all. Turns out that was the point.',
          'You don’t solve anything today, but you leave lighter than you walked in.',
        ],
      },
      {
        id: 'clinicScreening',
        label: 'Get a basic health screening',
        statDeltas: { wellness: 2 },
        narrativeVariants: [
          'Blood pressure, weight, a few questions on a clipboard. Boring in the best way.',
          'Nothing about your body is surprising the intake nurse today, and that’s a genuinely good sign.',
        ],
      },
    ],
  },
  {
    id: 'bank',
    name: 'Bank / Budgeting Office',
    dimension: 'home',
    secondaryDimension: 'purpose',
    availableBlocks: ['morning', 'afternoon'],
    eventWeight: 4,
    activities: [
      {
        id: 'bankCounselorMeeting',
        label: 'Meet with a budgeting counselor',
        statDeltas: { stability: 2, direction: 1 },
        narrativeVariants: [
          'He walks you through a payment calendar that actually matches your paychecks. Revelatory, almost.',
          'You leave with a plan on paper instead of a plan in your head. It’s harder to lose track of paper.',
        ],
      },
      {
        id: 'bankAutoPay',
        label: 'Set up automatic bill pay',
        statDeltas: { stability: 2 },
        narrativeVariants: [
          'One less thing to remember at midnight. You set it and you feel the weight of it lift a little.',
          'The teller sets it up in ten minutes. You wonder why you put this off for a month.',
        ],
      },
      {
        id: 'bankOpenSavings',
        label: 'Open a small savings account',
        moneyCost: 10,
        statDeltas: { stability: 1, direction: 1 },
        narrativeVariants: [
          'It’s twenty dollars to start. Not much. But it’s a different twenty dollars than the twenty you used to spend on old habits.',
          'The account is basically empty. Having one at all still feels like a small, deliberate vote for a future.',
        ],
      },
    ],
  },
  {
    id: 'school',
    name: 'School / Night Class',
    dimension: 'purpose',
    availableBlocks: ['evening'],
    eventWeight: 3,
    activities: [
      {
        id: 'schoolAttendClass',
        label: 'Attend night class',
        statDeltas: { direction: 3 },
        moneyCost: 10,
        narrativeVariants: [
          'It’s a two-hour class after a full day and you almost skip it. You don’t. You’re glad after.',
          'The material is slow going, but you’re further into it than you were a month ago.',
        ],
      },
      {
        id: 'schoolStudy',
        label: 'Study for an upcoming exam',
        statDeltas: { direction: 2 },
        diminishingReturns: { cooldownDays: 2, decayFactor: 0.7 },
        narrativeVariants: [
          'You get through two chapters and a headache. Progress is progress.',
          'You quiz yourself out loud in the kitchen like nobody’s going to hear. Somebody probably does.',
        ],
      },
      {
        id: 'schoolAdvisorMeeting',
        label: 'Meet with an academic advisor',
        statDeltas: { direction: 1 },
        narrativeVariants: [
          'She maps out a realistic timeline instead of an ambitious one. Realistic sounds better right now.',
          'You leave the meeting with an actual plan instead of a vague intention.',
        ],
      },
    ],
  },
  {
    id: 'familyFriends',
    name: "Family & Friends' House",
    dimension: 'community',
    availableBlocks: ['afternoon', 'evening'],
    eventWeight: 6,
    activities: [
      {
        id: 'familyDinner',
        label: 'Have dinner with family',
        statDeltas: { connection: 2 },
        familyTrustDelta: 1,
        narrativeVariants: [
          'Nobody brings up the hard stuff tonight. It’s just dinner, and that’s allowed to be enough.',
          'The conversation is ordinary — work, weather, a rerun somebody half-watches. Ordinary is new, and good.',
        ],
      },
      {
        id: 'familyPickUpKid',
        label: 'Pick up your kid on time',
        statDeltas: { connection: 1 },
        familyTrustDelta: 2,
        narrativeVariants: [
          'You’re there five minutes early, actually. She doesn’t say anything about it, but she notices.',
          'No excuses needed today — you just show up, on time, like it’s not a big deal. It kind of is.',
        ],
      },
      {
        id: 'familyHardConversation',
        label: 'Have the conversation you’ve been avoiding',
        statDeltas: { connection: 1, wellness: -1 },
        familyTrustDelta: 3,
        narrativeVariants: [
          'It’s awkward and a little painful and you don’t fully fix anything. But you didn’t dodge it this time, and that’s noticed.',
          'You say the thing you’ve been rehearsing for weeks. It comes out clumsier than planned. It still lands.',
        ],
      },
    ],
  },
  {
    id: 'cornerStore',
    name: 'Corner Store / Diner',
    dimension: 'community',
    availableBlocks: ['morning', 'afternoon', 'evening'],
    eventWeight: 5,
    activities: [
      {
        id: 'cornerStoreChatRegulars',
        label: 'Grab coffee and chat with the regulars',
        statDeltas: { connection: 1, wellness: 1 },
        diminishingReturns: { cooldownDays: 2, decayFactor: 0.6 },
        narrativeVariants: [
          'The guy behind the counter knows your order now. Small-town stuff, in the middle of a city.',
          'You end up in a ten-minute conversation about nothing in particular with someone you barely know. It’s nice.',
        ],
      },
      {
        id: 'cornerStoreGroceries',
        label: 'Pick up groceries for the week',
        moneyCost: 25,
        statDeltas: { stability: 1 },
        narrativeVariants: [
          'You get the boring, necessary stuff — eggs, bread, coffee. The fridge stops being embarrassing.',
          'Nothing exciting on the list. The list gets done anyway.',
        ],
      },
      {
        id: 'cornerStoreImpulseBuy',
        label: 'Impulse-buy something you don’t need',
        moneyCost: 15,
        statDeltas: { wellness: -1 },
        narrativeVariants: [
          'A scratch ticket and a candy bar you didn’t plan on. Small, forgettable, a little deflating in hindsight.',
          'You buy something dumb on the way out because it was a long day. It doesn’t undo anything. It just wasn’t the best use of fifteen dollars.',
        ],
      },
    ],
  },
];

export const CROSSROADS_EVENTS: EventDef[] = [
  {
    id: 'rentShortfall',
    title: "Rent's Due Friday",
    triggerConditions: {
      locationIds: ['home', 'bank'],
      statThresholds: { stability: { below: 55 } },
      minDaysSinceLastCrossroads: 3,
    },
    weight: 8,
    choices: [
      {
        label: 'Call the landlord and work out a partial-payment plan',
        statDeltas: { stability: 2, direction: 1 },
        outcomeText: 'The landlord isn’t thrilled, but she takes the partial payment and gives you two weeks on the rest. You can breathe again.',
      },
      {
        label: 'Pick up an extra shift to cover it in cash',
        statDeltas: { stability: 1, wellness: -1 },
        moneyDelta: 40,
        outcomeText: 'You cover it, but it costs you a day you didn’t really have to spare.',
      },
      {
        label: 'Let it ride a few more days and see what comes in',
        statDeltas: { stability: -1 },
        outcomeText: 'Nothing happens today. The rent is still due, though, and you know it.',
      },
    ],
  },
  {
    id: 'landlordMaintenanceIgnored',
    title: 'The Landlord Isn’t Returning Calls',
    triggerConditions: {
      locationIds: ['home'],
      minDaysSinceLastCrossroads: 4,
    },
    weight: 4,
    choices: [
      {
        label: 'File a formal maintenance request in writing',
        statDeltas: { stability: 1, direction: 1 },
        outcomeText: 'It’s a paper trail now, not just a voicemail. Slower than you’d like, but it’s moving.',
      },
      {
        label: 'Fix the small stuff yourself and let the rest go',
        statDeltas: { stability: 1 },
        moneyDelta: -20,
        outcomeText: 'You pick up a part at the hardware store and handle it. Not your job, technically. Done anyway.',
      },
      {
        label: 'Let it go for now — you’ve got bigger things this week',
        statDeltas: {},
        outcomeText: 'The leaky faucet keeps leaking. You’ve got bandwidth for one thing today, and this wasn’t it.',
      },
    ],
  },
  {
    id: 'sponsorPushbackExcuse',
    title: 'Your Sponsor Isn’t Buying It',
    triggerConditions: {
      locationIds: ['sponsorHouse'],
      minDaysSinceLastCrossroads: 3,
    },
    weight: 7,
    choices: [
      {
        label: 'Own it — tell them the real reason you skipped',
        statDeltas: { connection: 2, direction: 1 },
        familyTrustDelta: 0,
        outcomeText: '"Okay," they say, "now we can actually talk about it." It’s uncomfortable. It’s also relieving.',
        setsFlag: 'sponsorHonestyStreak',
      },
      {
        label: 'Stick with the excuse and change the subject',
        statDeltas: { connection: -1 },
        outcomeText: 'They let it go for now. You both know they didn’t buy it.',
      },
      {
        label: 'Ask them to just tell you what to do instead',
        statDeltas: { connection: 1 },
        outcomeText: '"That’s not really how this works," they say, not unkindly. They ask you a question instead of giving you an answer.',
      },
    ],
  },
  {
    id: 'sponsorHardQuestion',
    title: 'A Question You Weren’t Ready For',
    triggerConditions: {
      locationIds: ['sponsorHouse'],
      statThresholds: { direction: { below: 50 } },
      minDaysSinceLastCrossroads: 4,
    },
    weight: 6,
    choices: [
      {
        label: 'Sit with it and actually answer honestly',
        statDeltas: { connection: 2, wellness: -1, direction: 1 },
        outcomeText: 'It takes you a full minute to answer. The answer surprises you a little. So does saying it out loud.',
      },
      {
        label: 'Deflect with a joke',
        statDeltas: { connection: 1 },
        outcomeText: 'They laugh, then ask again, gentler. The question doesn’t go away just because you dodged it once.',
      },
      {
        label: 'Tell them you need more time before you can answer that',
        statDeltas: { connection: 1, direction: 1 },
        outcomeText: '"Fair," they say. "Bring it back next week." No pressure, just a placeholder.',
      },
    ],
  },
  {
    id: 'sponsorUnavailable',
    title: 'Your Sponsor Doesn’t Pick Up',
    triggerConditions: {
      locationIds: ['sponsorHouse'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 4,
    choices: [
      {
        label: 'Leave a message and sit with the discomfort of waiting',
        statDeltas: { connection: 1, wellness: -1 },
        outcomeText: 'You don’t love waiting. You do it anyway. They call back that evening.',
      },
      {
        label: 'Call a program friend instead',
        statDeltas: { connection: 2 },
        outcomeText: 'Not the same conversation you were planning to have, but a real one. Turns out that’s allowed too.',
      },
      {
        label: 'Decide you didn’t really need to talk anyway',
        statDeltas: {},
        outcomeText: 'Maybe true, maybe not. Either way, the day moves on without the conversation.',
      },
    ],
  },
  {
    id: 'therapistReducedHours',
    title: 'Your Therapist Brings Up Your Hours',
    triggerConditions: {
      locationIds: ['healthClinic'],
      statThresholds: { wellness: { below: 55 } },
      minDaysSinceLastCrossroads: 4,
    },
    weight: 6,
    choices: [
      {
        label: 'Ask your employer about cutting back a shift or two',
        statDeltas: { wellness: 2, direction: -1 },
        moneyDelta: -30,
        outcomeText: 'Fewer hours, less money, more air in your week. It’s a trade you can live with for now.',
      },
      {
        label: 'Tell her the hours are non-negotiable right now',
        statDeltas: { direction: 1, wellness: -1 },
        outcomeText: '"Understood," she says, and makes a note. "Let’s check back on this in a few weeks."',
      },
      {
        label: 'Agree to think about it and change nothing yet',
        statDeltas: { wellness: -1 },
        outcomeText: 'You leave with the same schedule and a small, nagging sense she had a point.',
      },
    ],
  },
  {
    id: 'therapistHonestCheckIn',
    title: 'Your Therapist Asks How You’re Really Doing',
    triggerConditions: {
      locationIds: ['healthClinic'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 5,
    choices: [
      {
        label: 'Give her the honest, unpolished version',
        statDeltas: { wellness: 2, connection: 1 },
        outcomeText: 'It’s messier than your usual answer. She thanks you for it anyway. It was more useful than "fine."',
      },
      {
        label: 'Give the short, reassuring answer and move on',
        statDeltas: { wellness: 1 },
        outcomeText: '"Fine, keeping busy." She nods, writes something down, doesn’t push. The session moves on.',
      },
      {
        label: 'Ask to reschedule — today’s not the day for this',
        statDeltas: {},
        outcomeText: 'She reschedules without comment. Some days aren’t for talking, and that’s fine too.',
      },
    ],
  },
  {
    id: 'daughterRecitalConflict',
    title: 'Your Daughter’s Recital Is Tonight',
    triggerConditions: {
      locationIds: ['familyFriends', 'meetingHall'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 7,
    choices: [
      {
        label: 'Go to the recital and miss tonight’s meeting',
        statDeltas: { connection: 1 },
        familyTrustDelta: 3,
        outcomeText: 'She spots you in the crowd and grins mid-song. You’ll catch a meeting tomorrow. Tonight was hers.',
      },
      {
        label: 'Go to the meeting and catch the next recital',
        statDeltas: { connection: 2 },
        familyTrustDelta: -1,
        outcomeText: 'You keep your meeting streak, but you know exactly what you missed, and so does she.',
      },
      {
        label: 'Ask your sponsor to come watch you both find a middle ground',
        statDeltas: { connection: 1, direction: 1 },
        familyTrustDelta: 1,
        outcomeText: 'You show up late to the recital after a short meeting stop. Not perfect. Both things got a little of you.',
      },
    ],
  },
  {
    id: 'familyOldWound',
    title: 'An Old Hurt Comes Up at the Table',
    triggerConditions: {
      locationIds: ['familyFriends'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 5,
    choices: [
      {
        label: 'Let them say it and just listen without defending yourself',
        statDeltas: { connection: 1, wellness: -1 },
        familyTrustDelta: 2,
        outcomeText: 'It stings. You don’t interrupt. When they’re done, something in the room feels a little less locked.',
      },
      {
        label: 'Explain your side of what happened',
        statDeltas: { connection: -1 },
        familyTrustDelta: 0,
        outcomeText: 'You’re not wrong, exactly. It still lands like you’re arguing instead of hearing them.',
      },
      {
        label: 'Ask if you can come back to this conversation another day',
        statDeltas: { connection: 1 },
        familyTrustDelta: 1,
        outcomeText: '"Okay," they say, a little guarded. The conversation isn’t finished. It’s just paused.',
      },
    ],
  },
  {
    id: 'employerScheduleChange',
    title: 'Your Manager Needs You to Cover a Shift',
    triggerConditions: {
      locationIds: ['workplace'],
      minDaysSinceLastCrossroads: 4,
    },
    weight: 6,
    choices: [
      {
        label: 'Say yes — the extra hours help right now',
        statDeltas: { direction: 1, wellness: -1 },
        moneyDelta: 50,
        outcomeText: 'It eats into your evening, but the money helps and your manager remembers you said yes.',
      },
      {
        label: 'Say you can’t — you already have something tonight',
        statDeltas: { direction: -1, connection: 1 },
        outcomeText: '"No problem, I’ll find someone else," she says, and means it. Nothing bad happens. You just said no.',
      },
      {
        label: 'Offer to cover half the shift as a compromise',
        statDeltas: { direction: 1 },
        moneyDelta: 25,
        outcomeText: 'You split the difference. It’s not exactly what either of you wanted, and it works out fine anyway.',
      },
    ],
  },
  {
    id: 'employerPastMention',
    title: 'A Coworker Brings Up Your Gap Year',
    triggerConditions: {
      locationIds: ['workplace'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 4,
    choices: [
      {
        label: 'Give a brief, honest answer and let it be',
        statDeltas: { direction: 1, wellness: -1 },
        outcomeText: '"Yeah, rough couple years, doing better now." He nods and it’s over. Nobody made it a bigger deal than it needed to be.',
      },
      {
        label: 'Deflect and change the subject',
        statDeltas: { direction: 1 },
        outcomeText: '"Long story," you say, and steer it toward the football scores. It works. The moment passes.',
      },
      {
        label: 'Let it bother you for the rest of the shift',
        statDeltas: { direction: -1, wellness: -1 },
        outcomeText: 'It was a throwaway comment. It doesn’t feel that way to you for the next four hours.',
      },
    ],
  },
  {
    id: 'employmentCenterEveningLead',
    title: 'A Job Lead With Evening Hours',
    triggerConditions: {
      locationIds: ['employmentCenter'],
      minDaysSinceLastCrossroads: 5,
      statThresholds: { direction: { below: 65 } },
    },
    weight: 4,
    choices: [
      {
        label: 'Apply anyway and figure out the meeting schedule later',
        statDeltas: { direction: 2 },
        outcomeText: 'You send the application. You’ll cross the meeting-night bridge if you get there.',
      },
      {
        label: 'Pass on it — keeping your evenings protected matters more right now',
        statDeltas: { connection: 1 },
        outcomeText: 'It might have been a good job. Your evenings are already spoken for, and that’s a real answer, not an excuse.',
      },
      {
        label: 'Ask the counselor if there’s a similar role with better hours',
        statDeltas: { direction: 1 },
        outcomeText: '"Let me check," she says. Nothing today, but she keeps an eye out.',
      },
    ],
  },
  {
    id: 'cornerStoreOldFriend',
    title: 'You Run Into Someone From Before',
    triggerConditions: {
      locationIds: ['cornerStore'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 6,
    choices: [
      {
        label: 'Keep it short and friendly, then head out',
        statDeltas: { wellness: 1 },
        outcomeText: '"Good to see you, take care" — and you mean it, and you also keep walking. Both true at once.',
      },
      {
        label: 'Catch up for a few minutes',
        statDeltas: { connection: 1, wellness: -1 },
        outcomeText: 'It’s fine, mostly. A little strange, hearing about a life you used to be closer to.',
      },
      {
        label: 'Text your sponsor about it afterward',
        statDeltas: { connection: 2 },
        outcomeText: '"Nothing happened, just wanted to say it out loud," you text. "Good," they write back. "That’s the whole job."',
      },
    ],
  },
  {
    id: 'cornerStoreTightBudgetWeek',
    title: 'The Register Total Is Higher Than You Expected',
    triggerConditions: {
      locationIds: ['cornerStore'],
      statThresholds: { money: { below: 60 } },
      minDaysSinceLastCrossroads: 4,
    },
    weight: 3,
    choices: [
      {
        label: 'Put a couple things back and stick to the list',
        statDeltas: { stability: 1 },
        outcomeText: 'A little embarrassing at the register. Nobody actually cares as much as it feels like they do.',
      },
      {
        label: 'Put it on the card and worry about it later',
        statDeltas: { stability: -1 },
        moneyDelta: -10,
        outcomeText: 'You get everything you came for. The math for later gets a little tighter.',
      },
      {
        label: 'Call it a wash and just get the essentials',
        statDeltas: {},
        outcomeText: 'You leave with less than you wanted and exactly what you need.',
      },
    ],
  },
  {
    id: 'serviceCenterOvercommit',
    title: 'They Ask If You Can Take On More',
    triggerConditions: {
      locationIds: ['serviceCenter'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 3,
    choices: [
      {
        label: 'Say yes to a bigger role',
        statDeltas: { connection: 2, direction: 1, wellness: -1 },
        outcomeText: 'It’s more responsibility than you planned on. You’re proud of it and a little stretched thin by it.',
      },
      {
        label: 'Say you’d rather stay at your current level for now',
        statDeltas: { connection: 1 },
        outcomeText: '"Totally fair," the coordinator says. Nobody’s keeping score of who does the most.',
      },
      {
        label: 'Suggest someone else who might want the role',
        statDeltas: { connection: 1, direction: 1 },
        outcomeText: 'You point them toward someone who’s been looking for exactly this. It feels good to make the connection.',
      },
    ],
  },
  {
    id: 'schoolExamPressure',
    title: 'A Big Exam Is Tomorrow',
    triggerConditions: {
      locationIds: ['school'],
      minDaysSinceLastCrossroads: 5,
    },
    weight: 3,
    choices: [
      {
        label: 'Stay up late cramming',
        statDeltas: { direction: 2, wellness: -2 },
        outcomeText: 'You know the material better. You also know you’re running on five hours of sleep tomorrow.',
      },
      {
        label: 'Study for an hour, then get real sleep',
        statDeltas: { direction: 1, wellness: 1 },
        outcomeText: 'You didn’t cover everything. You show up rested, which turns out to matter more than you thought.',
      },
      {
        label: 'Skip studying tonight and wing it',
        statDeltas: { direction: -1, wellness: 1 },
        outcomeText: 'You gave yourself the night off. Tomorrow’s exam is going to be a bit of a guess.',
      },
    ],
  },
  {
    id: 'pinkCloudClinic',
    title: 'The Wall You Didn’t See Coming',
    triggerConditions: {
      locationIds: ['healthClinic'],
      dayRange: [45, 75],
      minTotalDays: 60,
    },
    weight: 5,
    isPinkCloud: true,
    choices: [
      {
        label: 'Tell your provider things have gotten flatter and harder than they were early on',
        statDeltas: { wellness: 2, connection: 1 },
        outcomeText: '"That tracks," she says. "The early motivation wears off and this is what’s left to build on. It’s not a step backward." Hearing it named helps more than you expected.',
        setsFlag: 'pinkCloudNamed',
      },
      {
        label: 'Say things are fine and push through it alone',
        statDeltas: { wellness: -1 },
        outcomeText: 'You keep it to yourself. The flat, gray stretch doesn’t go away just because you didn’t mention it.',
      },
      {
        label: 'Ask for a referral to adjust your care plan',
        statDeltas: { wellness: 1, direction: 1 },
        outcomeText: 'She adjusts your plan and books a follow-up. Nothing dramatic, just a small course correction.',
      },
    ],
  },
  {
    id: 'pinkCloudSponsor',
    title: 'This Is Supposed to Be Easier By Now',
    triggerConditions: {
      locationIds: ['sponsorHouse'],
      dayRange: [45, 75],
      minTotalDays: 60,
    },
    weight: 5,
    isPinkCloud: true,
    choices: [
      {
        label: 'Admit the early excitement has worn off and it just feels like maintenance now',
        statDeltas: { connection: 2, wellness: 1 },
        outcomeText: '"That’s the part nobody warns you about," they say. "The beginning is the easy part to feel good about. This is the actual work." You believe them.',
        setsFlag: 'pinkCloudNamed',
      },
      {
        label: 'Say everything’s going great, nothing to report',
        statDeltas: { connection: -1 },
        outcomeText: 'They let it go, but they’ve heard this exact flat tone before from other people right around this point.',
      },
      {
        label: 'Ask if this flat stretch is normal',
        statDeltas: { connection: 1, wellness: 1 },
        outcomeText: '"Extremely," they say. "It’s not a warning sign. It’s just the part where the excitement wears off and the routine has to carry you instead."',
      },
    ],
  },
];

export const RELATIONSHIP_SEEDS: Record<RelationshipKey, RelationshipState> = {
  sponsor: {
    key: 'sponsor',
    npcName: 'Gail',
    trust: 55,
    lastInteractionDay: null,
    recentOutcomeFlags: [],
  },
  family: {
    key: 'family',
    npcName: 'your daughter Maya',
    trust: 40,
    lastInteractionDay: null,
    recentOutcomeFlags: [],
  },
  employer: {
    key: 'employer',
    npcName: 'your manager Dana',
    trust: 50,
    lastInteractionDay: null,
    recentOutcomeFlags: [],
  },
};

export const RECOVERY_CAPITAL_BANDS: { max: number; label: string }[] = [
  { max: 19, label: 'on shaky ground' },
  { max: 39, label: 'stretched thin' },
  { max: 59, label: 'finding your footing' },
  { max: 79, label: 'steady' },
  { max: 100, label: 'solid ground' },
];

export const WORK_BLOCK_QUOTA = 5; // out of 21 blocks/week
