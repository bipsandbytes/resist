import fs from 'fs';
import path from 'path';

// Generate timestamps for the last 20 days (2 posts per day)
const generateTimestamps = () => {
  const timestamps = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (let day = 0; day < 20; day++) {
    const dayStart = now - (day * dayInMs);
    // First post of the day (morning)
    timestamps.push(dayStart - (8 * 60 * 60 * 1000)); // 8 AM
    // Second post of the day (evening)
    timestamps.push(dayStart - (18 * 60 * 60 * 1000)); // 6 PM
  }
  
  return timestamps;
};

// Content templates for variety
const contentTemplates = [
  {
    text: "Just finished reading an amazing book about space exploration! The universe is truly fascinating 🌌📚 #education #learning",
    authorName: "BookLover",
    classification: {
      Education: { score: 0.9, subcategories: { "Learning and education": 0.8, "News, politics, and social concern": 0.1 } },
      Entertainment: { score: 0.05, subcategories: { "Celebrities, sports, and culture": 0.03, "Humor and amusement": 0.02 } },
      Emotion: { score: 0.05, subcategories: { "Anxiety and fear": 0.02, "Controversy and clickbait": 0.03 } }
    },
    accumulatedText: "education learning book reading space"
  },
  {
    text: "This cat video is the cutest thing I've seen all day! 😸❤️ #cute #viral",
    authorName: "CatPerson",
    classification: {
      Education: { score: 0.02, subcategories: { "Learning and education": 0.01, "News, politics, and social concern": 0.01 } },
      Entertainment: { score: 0.95, subcategories: { "Celebrities, sports, and culture": 0.1, "Humor and amusement": 0.85 } },
      Emotion: { score: 0.03, subcategories: { "Anxiety and fear": 0.01, "Controversy and clickbait": 0.02 } }
    },
    accumulatedText: "entertainment cute cat video viral"
  },
  {
    text: "New study shows that meditation can reduce stress by 40%. Time to start my daily practice! 🧘‍♀️ #wellness #health",
    authorName: "WellnessCoach",
    classification: {
      Education: { score: 0.8, subcategories: { "Learning and education": 0.7, "News, politics, and social concern": 0.1 } },
      Entertainment: { score: 0.1, subcategories: { "Celebrities, sports, and culture": 0.05, "Humor and amusement": 0.05 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "education wellness health meditation stress"
  },
  {
    text: "BREAKING: Major tech company announces revolutionary new product! This could change everything! 🚀 #tech #innovation",
    authorName: "TechNews",
    classification: {
      Education: { score: 0.7, subcategories: { "Learning and education": 0.3, "News, politics, and social concern": 0.4 } },
      Entertainment: { score: 0.2, subcategories: { "Celebrities, sports, and culture": 0.15, "Humor and amusement": 0.05 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "news technology innovation product announcement"
  },
  {
    text: "Taylor Swift's new album is absolutely incredible! Every song is a masterpiece 🎵✨ #music #entertainment",
    authorName: "MusicFan",
    classification: {
      Education: { score: 0.05, subcategories: { "Learning and education": 0.02, "News, politics, and social concern": 0.03 } },
      Entertainment: { score: 0.9, subcategories: { "Celebrities, sports, and culture": 0.8, "Humor and amusement": 0.1 } },
      Emotion: { score: 0.05, subcategories: { "Anxiety and fear": 0.02, "Controversy and clickbait": 0.03 } }
    },
    accumulatedText: "entertainment music taylor swift album"
  },
  {
    text: "Just completed a 10-mile run! Feeling amazing and energized 💪🏃‍♀️ #fitness #health",
    authorName: "FitnessGuru",
    classification: {
      Education: { score: 0.3, subcategories: { "Learning and education": 0.2, "News, politics, and social concern": 0.1 } },
      Entertainment: { score: 0.4, subcategories: { "Celebrities, sports, and culture": 0.3, "Humor and amusement": 0.1 } },
      Emotion: { score: 0.3, subcategories: { "Anxiety and fear": 0.1, "Controversy and clickbait": 0.2 } }
    },
    accumulatedText: "fitness health exercise running workout"
  },
  {
    text: "This political debate is getting heated! What are your thoughts on the latest policy proposal? 🤔 #politics #debate",
    authorName: "PoliticalPundit",
    classification: {
      Education: { score: 0.8, subcategories: { "Learning and education": 0.2, "News, politics, and social concern": 0.6 } },
      Entertainment: { score: 0.1, subcategories: { "Celebrities, sports, and culture": 0.05, "Humor and amusement": 0.05 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "news politics debate policy current events"
  },
  {
    text: "New restaurant opened downtown and the food is absolutely divine! 🍕👨‍🍳 #food #restaurant",
    authorName: "Foodie",
    classification: {
      Education: { score: 0.1, subcategories: { "Learning and education": 0.05, "News, politics, and social concern": 0.05 } },
      Entertainment: { score: 0.7, subcategories: { "Celebrities, sports, and culture": 0.2, "Humor and amusement": 0.5 } },
      Emotion: { score: 0.2, subcategories: { "Anxiety and fear": 0.1, "Controversy and clickbait": 0.1 } }
    },
    accumulatedText: "entertainment food restaurant dining"
  },
  {
    text: "The new Marvel movie exceeded all expectations! The special effects were mind-blowing! 🎬✨ #movies #entertainment",
    authorName: "MovieBuff",
    classification: {
      Education: { score: 0.05, subcategories: { "Learning and education": 0.02, "News, politics, and social concern": 0.03 } },
      Entertainment: { score: 0.85, subcategories: { "Celebrities, sports, and culture": 0.7, "Humor and amusement": 0.15 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "entertainment movies marvel special effects"
  },
  {
    text: "BREAKING: Scientists discover new species in the Amazon rainforest! This is incredible! 🌿🔬 #science #discovery",
    authorName: "ScienceNews",
    classification: {
      Education: { score: 0.9, subcategories: { "Learning and education": 0.7, "News, politics, and social concern": 0.2 } },
      Entertainment: { score: 0.05, subcategories: { "Celebrities, sports, and culture": 0.03, "Humor and amusement": 0.02 } },
      Emotion: { score: 0.05, subcategories: { "Anxiety and fear": 0.02, "Controversy and clickbait": 0.03 } }
    },
    accumulatedText: "education science discovery rainforest species"
  },
  {
    text: "This dog's reaction to seeing snow for the first time is priceless! ❄️🐕 #cute #viral",
    authorName: "PetLover",
    classification: {
      Education: { score: 0.02, subcategories: { "Learning and education": 0.01, "News, politics, and social concern": 0.01 } },
      Entertainment: { score: 0.95, subcategories: { "Celebrities, sports, and culture": 0.1, "Humor and amusement": 0.85 } },
      Emotion: { score: 0.03, subcategories: { "Anxiety and fear": 0.01, "Controversy and clickbait": 0.02 } }
    },
    accumulatedText: "entertainment cute dog snow viral"
  },
  {
    text: "New research shows that coffee can improve memory retention! ☕🧠 #health #research",
    authorName: "HealthResearcher",
    classification: {
      Education: { score: 0.8, subcategories: { "Learning and education": 0.6, "News, politics, and social concern": 0.2 } },
      Entertainment: { score: 0.1, subcategories: { "Celebrities, sports, and culture": 0.05, "Humor and amusement": 0.05 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "education health research coffee memory"
  },
  {
    text: "The Lakers vs Warriors game was absolutely insane! What a finish! 🏀🔥 #basketball #sports",
    authorName: "SportsFan",
    classification: {
      Education: { score: 0.1, subcategories: { "Learning and education": 0.05, "News, politics, and social concern": 0.05 } },
      Entertainment: { score: 0.8, subcategories: { "Celebrities, sports, and culture": 0.7, "Humor and amusement": 0.1 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "entertainment sports basketball lakers warriors"
  },
  {
    text: "This recipe for homemade pizza is a game-changer! 🍕👨‍🍳 #cooking #food",
    authorName: "ChefHome",
    classification: {
      Education: { score: 0.6, subcategories: { "Learning and education": 0.5, "News, politics, and social concern": 0.1 } },
      Entertainment: { score: 0.3, subcategories: { "Celebrities, sports, and culture": 0.1, "Humor and amusement": 0.2 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "education cooking recipe pizza homemade"
  },
  {
    text: "BREAKING: Major climate agreement reached at international summit! 🌍📊 #climate #news",
    authorName: "ClimateNews",
    classification: {
      Education: { score: 0.9, subcategories: { "Learning and education": 0.3, "News, politics, and social concern": 0.6 } },
      Entertainment: { score: 0.05, subcategories: { "Celebrities, sports, and culture": 0.03, "Humor and amusement": 0.02 } },
      Emotion: { score: 0.05, subcategories: { "Anxiety and fear": 0.02, "Controversy and clickbait": 0.03 } }
    },
    accumulatedText: "news climate agreement summit international"
  },
  {
    text: "This baby's laugh is the most contagious sound ever! 😂👶 #cute #viral",
    authorName: "BabyLover",
    classification: {
      Education: { score: 0.01, subcategories: { "Learning and education": 0.005, "News, politics, and social concern": 0.005 } },
      Entertainment: { score: 0.98, subcategories: { "Celebrities, sports, and culture": 0.1, "Humor and amusement": 0.88 } },
      Emotion: { score: 0.01, subcategories: { "Anxiety and fear": 0.005, "Controversy and clickbait": 0.005 } }
    },
    accumulatedText: "entertainment cute baby laugh viral"
  },
  {
    text: "New study reveals the benefits of daily walking for mental health! 🚶‍♀️🧠 #health #wellness",
    authorName: "HealthExpert",
    classification: {
      Education: { score: 0.8, subcategories: { "Learning and education": 0.6, "News, politics, and social concern": 0.2 } },
      Entertainment: { score: 0.1, subcategories: { "Celebrities, sports, and culture": 0.05, "Humor and amusement": 0.05 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "education health walking mental wellness"
  },
  {
    text: "The new iPhone features are absolutely mind-blowing! 📱✨ #technology #innovation",
    authorName: "TechEnthusiast",
    classification: {
      Education: { score: 0.6, subcategories: { "Learning and education": 0.4, "News, politics, and social concern": 0.2 } },
      Entertainment: { score: 0.3, subcategories: { "Celebrities, sports, and culture": 0.2, "Humor and amusement": 0.1 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "technology iphone features innovation"
  },
  {
    text: "This sunset view from my balcony is absolutely breathtaking! 🌅✨ #nature #beautiful",
    authorName: "NatureLover",
    classification: {
      Education: { score: 0.2, subcategories: { "Learning and education": 0.1, "News, politics, and social concern": 0.1 } },
      Entertainment: { score: 0.7, subcategories: { "Celebrities, sports, and culture": 0.2, "Humor and amusement": 0.5 } },
      Emotion: { score: 0.1, subcategories: { "Anxiety and fear": 0.05, "Controversy and clickbait": 0.05 } }
    },
    accumulatedText: "entertainment nature sunset beautiful view"
  },
  {
    text: "BREAKING: New vaccine breakthrough could save millions of lives! 💉🔬 #health #science",
    authorName: "MedicalNews",
    classification: {
      Education: { score: 0.9, subcategories: { "Learning and education": 0.4, "News, politics, and social concern": 0.5 } },
      Entertainment: { score: 0.05, subcategories: { "Celebrities, sports, and culture": 0.03, "Humor and amusement": 0.02 } },
      Emotion: { score: 0.05, subcategories: { "Anxiety and fear": 0.02, "Controversy and clickbait": 0.03 } }
    },
    accumulatedText: "news health vaccine breakthrough science"
  }
];

const generateMockData = () => {
  const timestamps = generateTimestamps();
  const mockData = {};
  
  timestamps.forEach((timestamp, index) => {
    const template = contentTemplates[index % contentTemplates.length];
    const postId = `twitter-User${index + 1}-1951077584932053${400 + index}`;
    
    mockData[postId] = {
      accumulatedText: template.accumulatedText,
      artifacts: {
        overlayId: `overlay-${postId}`
      },
      classification: {
        Education: {
          subcategories: {
            "Learning and education": { score: template.classification.Education.subcategories["Learning and education"] },
            "News, politics, and social concern": { score: template.classification.Education.subcategories["News, politics, and social concern"] }
          },
          totalScore: template.classification.Education.score
        },
        Emotion: {
          subcategories: {
            "Anxiety and fear": { score: template.classification.Emotion.subcategories["Anxiety and fear"] },
            "Controversy and clickbait": { score: template.classification.Emotion.subcategories["Controversy and clickbait"] }
          },
          totalScore: template.classification.Emotion.score
        },
        Entertainment: {
          subcategories: {
            "Celebrities, sports, and culture": { score: template.classification.Entertainment.subcategories["Celebrities, sports, and culture"] },
            "Humor and amusement": { score: template.classification.Entertainment.subcategories["Humor and amusement"] }
          },
          totalScore: template.classification.Entertainment.score
        },
        totalAttentionScore: template.classification.Education.score + template.classification.Emotion.score + template.classification.Entertainment.score
      },
      debug: {},
      id: postId,
      lastClassificationText: template.accumulatedText,
      metadata: {
        lastSeen: timestamp,
        platform: "twitter",
        screenStatus: {
          enabled: true,
          lastUpdated: timestamp + 1000
        },
        timeSpent: Math.floor(Math.random() * 60000) + 10000
      },
      postData: {
        authorName: template.authorName,
        mediaElements: Math.random() > 0.5 ? [{"element": {}, "src": `https://pbs.twimg.com/media/post${index}.jpg`, "type": "image"}] : [],
        text: template.text
      },
      state: "complete",
      tasks: [
        {
          completedAt: timestamp + 2000,
          id: `${postId}-mock-task`,
          result: template.accumulatedText,
          resultType: "text",
          startedAt: timestamp + 1000,
          status: "completed",
          type: "mock-task"
        }
      ]
    };
  });
  
  return mockData;
};

// Generate the mock data
const mockData = generateMockData();

// Output to STDOUT
console.log(JSON.stringify(mockData, null, 2)); 