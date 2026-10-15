# GitHub Support request: purge PR #12 refs (paste into https://support.github.com/contact)

**Subject:** Please purge cached commits for pull request #12 in Astryks/Ecommercehelix after a history rewrite

**Body:**

Hello GitHub Support,

I own the repository https://github.com/Astryks/Ecommercehelix.

We rewrote the history of this repository to remove content that should never have been committed. All branches and tags were force-pushed with the cleaned history, and the old commits are no longer reachable from any branch or tag.

Pull request #12 (https://github.com/Astryks/Ecommercehelix/pull/12) still references the old commits through its read-only `refs/pull/12/head` (and merge) ref. That means the removed content can still be viewed in the pull request's "Files changed" and commit views, and through direct commit URLs.

Could you please:
1. Remove the cached views and dereference the old commits for pull request #12 (or delete the pull request if that is the only way), and
2. Run garbage collection on the repository so the unreachable commits are removed from GitHub's storage.

This is for my own repository and I confirm I want those commits permanently removed. I am happy to give any more detail you need.

Thank you,
Sid (Astryks)

---
How to send: sign in to GitHub as the repo owner, open https://support.github.com/contact, choose "Removing sensitive data", paste the subject and body above, and submit.
