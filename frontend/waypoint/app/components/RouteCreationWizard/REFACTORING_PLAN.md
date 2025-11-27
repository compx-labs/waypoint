# Route Creation Wizard - Componentization Plan

## Current Status
The `RouteCreationWizard.tsx` file is currently **3000+ lines** with all step components defined in a single file.

## Completed ✅

1. ✅ Created directory structure: `components/RouteCreationWizard/`
2. ✅ **types.ts** - Shared TypeScript interfaces and types
3. ✅ **utils.ts** - Utility functions (calculateFee, formatDuration, timeUnitToSeconds)
4. ✅ **TokenSelectionStep.tsx** - First step component extracted
5. ✅ **index.ts** - Main export file

## Remaining Work 📋

### Step Components to Extract (in order):

1. **AmountScheduleStep.tsx** (~400 lines)
   - Amount input with balance checks
   - Unlock frequency selection
   - Amount per period
   - Fee calculation display
   - Duration calculation

2. **TimingStep.tsx** (~150 lines)
   - Start time selection
   - Quick options (Now, Tomorrow)
   - Custom date/time picker

3. **RecipientStep.tsx** (~400 lines)
   - Recipient address input
   - NFD resolution for Algorand
   - Address validation
   - Address book integration

4. **PayerStep.tsx** (~400 lines)
   - Payer address input (invoice routes only)
   - NFD resolution for Algorand
   - Address validation
   - Address book integration

5. **SummaryStep.tsx** (~800 lines)
   - Review all details
   - Fee breakdown
   - Balance validation
   - Transaction creation logic
   - Separate handlers for Aptos and Algorand

### Main Wizard Component

6. **RouteCreationWizard.tsx** (refactored, ~300 lines)
   - Step navigation logic
   - Form state management
   - Progress indicator
   - Step configuration based on route type

## Benefits of Componentization

### 1. **Maintainability**
- Each step is self-contained
- Easier to find and fix bugs
- Clear separation of concerns

### 2. **Readability**
- Each file focuses on one responsibility
- Reduced cognitive load when reviewing code
- Easier onboarding for new developers

### 3. **Reusability**
- Steps can be reused in different wizards
- Utility functions centralized
- Type definitions shared across components

### 4. **Testing**
- Each step can be unit tested independently
- Easier to mock dependencies
- More focused test suites

### 5. **Performance**
- Potential for lazy loading steps
- Smaller bundle chunks
- Better code splitting

## File Structure (Final)

```
components/RouteCreationWizard/
├── index.tsx                    # Main exports
├── RouteCreationWizard.tsx      # Main wizard orchestrator (~300 lines)
├── types.ts                     # Shared TypeScript types ✅
├── utils.ts                     # Utility functions ✅
├── TokenSelectionStep.tsx       # Step 1 ✅
├── AmountScheduleStep.tsx       # Step 2
├── TimingStep.tsx               # Step 3
├── RecipientStep.tsx            # Step 4
├── PayerStep.tsx                # Step 5 (invoice routes)
└── SummaryStep.tsx              # Step 6 (final review)
```

## Next Steps

1. Extract `AmountScheduleStep` (most complex due to fee calculations)
2. Extract `TimingStep` (simplest)
3. Extract `RecipientStep` and `PayerStep` (similar logic)
4. Extract `SummaryStep` (largest, has transaction logic)
5. Refactor main `RouteCreationWizard.tsx` to import and use extracted components
6. Update import in parent component to use new module structure
7. Test all flows (regular routes, invoice routes, both networks)
8. Delete old `RouteCreationWizard.tsx` file

## Migration Strategy

### Phase 1: Extract Components (Current)
- Create new component files
- Keep old file unchanged for now
- Ensure all components export properly

### Phase 2: Create New Main Wizard
- Build new `RouteCreationWizard.tsx` that imports extracted steps
- Test in isolation

### Phase 3: Switch Over
- Update parent imports from old file to new directory
- Test all user flows
- Delete old file

### Phase 4: Polish
- Add JSDoc comments
- Optimize imports
- Run linter and fix any issues

##Would you like me to:
1. **Continue extracting** the remaining step components one by one?
2. **Extract a specific step** (let me know which one)?
3. **Do a complete extraction** in one go (will take multiple messages)?
4. **Something else**?

Let me know how you'd like to proceed!

