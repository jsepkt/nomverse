import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface StoryChapter {
  slug: string;
  chapter: number;
  title: string;
  date: string;
  author: string;
  summary: string;
  tags: string[];
  content: string;
}

// Fallback embedded chapters for client-side or static rendering resilience
export const DEFAULT_STORIES: StoryChapter[] = [
  {
    slug: "chapter-01",
    chapter: 1,
    title: "The Mysterious Golden Drop",
    date: "2026-09-16",
    author: "0xGenesisNom",
    tags: ["genesis", "solana", "cc0", "nomster"],
    summary: "Nomster awakens in a cluster of glowing Solana validator nodes and discovers candy falling from confirmed cryptographic blocks.",
    content: `Deep within the humming sub-stratum of the decentralized web, between slot 328,000,000 and the speed-of-light gossip protocol of Solana, a small anomaly stirred.

He wasn't an algorithm. He wasn't a bot scanning for arbitrage or MEV extraction. 

He was **Nomster**.

A round, impossibly green creature with wide, inquisitive cartoon eyes and a perpetual appetite. He blinked into existence amidst a forest of fiber-optic cables and glowing liquid-cooled validator towers. The air smelled of ozone, cryptographic hashes, and warm copper.

Suddenly, a resonant chime echoed across the network:

> *PING. BLOCK #328,194,002 CONFIRMED IN 412ms.*

From the high vault of the cluster ceiling, a shimmering projectile broke free from the block header. It tumbled through the neon light, glistening like polished amber and bound with three radiant streaks—cyan, purple, and gold.

Nomster’s pupils dilated to the size of full moons. His little antenna twitched with electric anticipation. 

*“...Nom?”*

The candy bounced off a memory rack, ricocheted off a heat pipe with an elastic *boing*, and plummeted directly toward him. Driven purely by ancient mascot instincts, Nomster threw his head back, opened his cheerful mouth wide, and caught the golden drop in mid-air.

**CRUNCH! NOM!**

A cascade of golden sparks burst from his cheeks. The candy tasted like pure decentralized consensus—sweet, frictionless, and completely unpermissioned. 

For the first time in blockchain history, a transaction didn't settle to a cold hardware wallet. It settled into the belly of the most insatiable mascot in Web3.

Nomster licked his lips, stared upward into the endless canopy of raining blocks, and let out a joyful, hungry cheer:

**“MORE NOM!”**`,
  },
  {
    slug: "chapter-02",
    chapter: 2,
    title: "The Open-Source Liberation",
    date: "2026-09-16",
    author: "BuidlAnon & The CC0 Guild",
    tags: ["cc0", "liberation", "open-source", "pumpfun"],
    summary: "Developers discover Nomster's blueprints locked in a proprietary vault, shred the patents under CC0 1.0 Universal, and unleash him across decentralized networks.",
    content: `Word of the hungry green mascot spread through private Telegram channels and encrypted Discord servers. 

Corporate suits in glass towers tried to claim him:
*“File trademark patents on his cheeks!”* yelled the trademark attorneys.
*“Lock his vector SVG behind a proprietary subscription license!”* demanded the Web2 legacy executives.
*“We will sue anyone who prints stickers of his cheerful fangs!”* threatened the copyright trolls.

When Nomster heard the word *“proprietary,”* his antenna drooped. His smile vanished. A mascot trapped in walled gardens cannot eat the infinite candies of the decentralized web.

That was the night the **CC0 Resistance** struck.

A ragtag syndicate of open-source rustaceans, frontend artisans, and meme connoisseurs infiltrated the central repository. They didn't steal Nomster for themselves. Instead, they opened his master file and ran the ultimate liberation command:

\`\`\`bash
git rm --cached COPYRIGHT_ALL_RIGHTS_RESERVED.txt
curl -sL https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt > LICENSE
git commit -m "feat(freedom): Nomster is now 100% CC0 Public Domain forever"
git push origin main --force
\`\`\`

In an instant, every line of SVG code, every bounce tween, every chime, and every drop of his lore was released into the public domain. 

No royalty clauses. No cease-and-desist letters. No permission gates. 

Anyone could print Nomster hoodies. Anyone could mint derivative arcade levels. Anyone could fair launch his community token on pump.fun without bending the knee to a corporate overlord.

Nomster leaped onto the table, his eyes shining with vibrant emerald light. He was no longer just a mascot; he was a public commons with a high-velocity appetite.

He looked at the open terminal, patted his round tummy, and grinned:

*“Now the whole universe is invited to the feast.”*`,
  },
];

export function getAllStories(): StoryChapter[] {
  try {
    const storiesDir = path.join(process.cwd(), "src", "content", "stories");
    if (!fs.existsSync(storiesDir)) {
      return DEFAULT_STORIES;
    }

    const fileNames = fs.readdirSync(storiesDir).filter((fn) => fn.endsWith(".md") && fn !== "README.md");

    if (fileNames.length === 0) {
      return DEFAULT_STORIES;
    }

    const stories: StoryChapter[] = fileNames.map((fileName) => {
      const fullPath = path.join(storiesDir, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const slug = fileName.replace(/\.md$/, "");

      return {
        slug,
        chapter: data.chapter || parseInt(slug.replace(/\D/g, ""), 10) || 1,
        title: data.title || "Untitled Chapter",
        date: data.date || "2026-09-16",
        author: data.author || "Community Contributor",
        summary: data.summary || "",
        tags: data.tags || ["lore", "nomverse"],
        content,
      };
    });

    return stories.sort((a, b) => a.chapter - b.chapter);
  } catch (err) {
    console.warn("Could not read local story files from disk, using fallback stories:", err);
    return DEFAULT_STORIES;
  }
}
