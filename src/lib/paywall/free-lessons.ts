/**
 * THE ONE PLACE TO CHANGE WHICH LEARN LESSONS ARE FREE.
 *
 * Everyone (signed out, or on the Free plan) can read these lessons in full.
 * Every other lesson shows a teaser (title, what you'll learn, time) and an
 * "Unlock with Starter" button. Starter, Growth (and trials) read everything.
 *
 * Add or remove a lesson ref (the "x.y" in "Lesson x.y: ...") and deploy.
 * Refs never change, so saved progress is safe either way.
 */
export const FREE_LESSONS: readonly string[] = [
  // Start here: the profit basics. These also power the Free plan's own
  // course goals (profit dashboard, daily numbers, key numbers).
  "1.7", "1.1", "1.2", "1.5", "1.8", "1.3", "1.4", "1.6", "1.9", "1.10",
  // Attract: the first lesson of the path, plus the two plain "where do I start" guides.
  "13.1", // Plan before you build (first lesson of "Get your store ready first")
  "8.17", // Meta ads 101 (start here if you have never run an ad)
  "8.18", // Which channel first? A simple guide
  // Convert
  "30.1", // Collect your customers' own words
  "15.1", // Five ways to make an offer stronger
  // Grow
  "17.7", // After the sale
];
