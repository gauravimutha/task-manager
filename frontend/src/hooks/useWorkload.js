/**
 * useWorkload.js
 *
 * Returns each user's "In Progress" task count derived from the live tasks array.
 * Structured so the data source can be swapped for a backend API call later —
 * just replace the body with a fetch() / useEffect() pattern.
 *
 * @param {string[]} users   - list of user names
 * @param {object[]} tasks   - all tasks from state
 * @returns {object[]}       - [{ name, inProgressCount }, ...]
 */
export function useWorkload(users, tasks) {
  return users.map(name => ({
    name,
    inProgressCount: tasks.filter(
      t => t.columnId === 'inprogress' && (t.assignees || []).includes(name)
    ).length,
  }));
}
