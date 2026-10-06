import { describe, it, expect } from 'vitest';
import { checkBrandPaletteContrast } from '@hjmds/design-contracts/palette-contrast';
import { compositionBrandFixtures } from '../../shared/composition-brand-fixtures';
describe('product composition brand fixtures',()=>{for(const [name,palette] of Object.entries(compositionBrandFixtures))it(`${name} preserves semantic contrast in both themes`,()=>{expect(checkBrandPaletteContrast(palette)).toEqual({light:[],dark:[]});});});
