import { describe, it, expect } from 'vitest'

describe('stageInitialsToName', () => {
  function stageInitialsToName(initials) {
    const stageNames = {
      DL: "Dream Land N64",
      YS: "Yoshi's Story", 
      PS: "Pokémon Stadium",
      FD: "Final Destination",
      FoD: "Fountain of Dreams",
      BF: "Battlefield"
    };
    return stageNames[initials] || "Battlefield";
  }

  it('should return correct stage name for valid initials', () => {
    expect(stageInitialsToName('YS')).toBe("Yoshi's Story")
    expect(stageInitialsToName('FD')).toBe("Final Destination")
  })

  it('should return Battlefield for unknown initials', () => {
    expect(stageInitialsToName('Foobar')).toBe("Battlefield")
  })
})

describe('checkHighlighted', () => {
  function checkHighlighted(currentPercent, koPercent) {
    return currentPercent >= koPercent;
  }

  it('should return true when current percent is greater than or equal to KO percent', () => {
    expect(checkHighlighted(100, 83)).toBe(true)
    expect(checkHighlighted(83, 83)).toBe(true)
  })

  it('should return false when current percent is less than KO percent', () => {
    expect(checkHighlighted(50, 83)).toBe(false)
  })
})

describe('calcWidth', () => {
  const calcWidth = (currentPercent, koPercent) =>
    (currentPercent && koPercent) ? 
      `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%` : '0%'

  it('should calculate correct width percentage', () => {
    expect(calcWidth(50, 100)).toBe('50.0%')
    expect(calcWidth(83, 83)).toBe('100.0%')
    expect(calcWidth(150, 100)).toBe('100.0%') 
  })

  it('should return 0% for invalid inputs', () => {
    expect(calcWidth(null, 100)).toBe('0%')
    expect(calcWidth(undefined, 100)).toBe('0%')
    expect(calcWidth(NaN, 100)).toBe('0%')
  })
})
