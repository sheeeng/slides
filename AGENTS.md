# AGENTS

## Writing Style

- Ensure adherence to Chicago Manual of Style
- Use correct grammar and using proper punctuation in all comments, debug outputs, plain text descriptions, and documentation.
- Follow Chicago Manual of Style capitalization conventions.
    - Use title case (headline style) for headings, titles, and section names.
    - Use sentence case (sentence style) for comments, debug outputs, plain text descriptions, and explanatory text.
    - Always capitalize proper nouns regardless of context.
- For title case (headline style) for headings, apply these Chicago Manual of Style rules.
    - Always capitalize the first and last words.
    - Capitalize all nouns, pronouns, verbs, adjectives, and adverbs.
    - Lowercase articles such as a, an, the.
    - Lowercase coordinating conjunctions such as and, but, or, for, nor, so, yet.
    - Lowercase prepositions such as at, by, for, from, in, into, of, on, to, with, between, through.
    - Lowercase "to" in infinitives such as to run, to see, to build.
    - Exception: Capitalize prepositions when used adverbially or adjectivally ("Look Up," "Turn Down") or in verb phrases.
- Don't use normal dashes or proper em dashes (—).
- Don't use parenthesis `()` to phrase terms.
- Use concise, but not terse phrasing.
- Fix grammatically incomplete sentences.

## Commands

- Use GNU-style explicit arguments over abbreviated ones. Example: Use `date --universal +"%Y-%m-%dT%H:%M:%SZ"` over `date -u +"%Y-%m-%dT%H:%M:%SZ"`. Use `set -o errexit` over `set -e` in shell scripts.
