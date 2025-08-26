# 🛡️ Development Checklist

## Before Adding New Code

### ✅ Import Checklist
- [ ] Add all imports at the top of the file
- [ ] Import icons from `lucide-react` when using them
- [ ] Import components from their correct paths
- [ ] Use relative imports (`@/`) for local files

### ✅ Component Checklist
- [ ] Add proper prop types or TypeScript interfaces
- [ ] Handle loading and error states
- [ ] Add proper key props to mapped elements
- [ ] Check for undefined/null values

### ✅ Testing Checklist
- [ ] Test immediately after adding new code
- [ ] Test in different browsers
- [ ] Test with different data states
- [ ] Check console for errors

## Before Committing

### ✅ Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run lint:fix` - auto-fix issues
- [ ] No console.log statements in production code
- [ ] No unused imports or variables

### ✅ Functionality
- [ ] All features work as expected
- [ ] No broken imports or undefined variables
- [ ] No TypeScript errors (if using TS)
- [ ] Responsive design works

### ✅ Git
- [ ] Meaningful commit message
- [ ] No sensitive data in commits
- [ ] No large files or build artifacts

## Common Time Bomb Bugs to Avoid

### ❌ Missing Imports
```javascript
// BAD - Will break randomly
<Plus className="w-4 h-4" />

// GOOD - Always import
import { Plus } from "lucide-react";
<Plus className="w-4 h-4" />
```

### ❌ Undefined Variables
```javascript
// BAD - Will cause runtime errors
const result = someFunction(data);

// GOOD - Check if function exists
if (typeof someFunction === 'function') {
  const result = someFunction(data);
}
```

### ❌ Unhandled Async Operations
```javascript
// BAD - No error handling
const data = await fetchData();

// GOOD - Handle errors
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
}
```

## Quick Commands

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix

# Safe development (lint + dev)
npm run dev:safe

# Pre-commit check
npm run pre-commit
```

## VS Code Extensions (Recommended)

- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Error Lens

## Emergency Fixes

If you encounter a "random" break:

1. **Check imports** - Look for missing imports
2. **Clear caches** - `rm -rf node_modules/.vite`
3. **Restart dev server** - `npm run dev`
4. **Check console** - Look for undefined variables
5. **Run linting** - `npm run lint:fix`
