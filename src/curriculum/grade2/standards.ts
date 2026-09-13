import type { DomainInfo, StandardInfo } from '../types';


export const GRADE_2_DOMAINS: DomainInfo[] = [
  {
    id: 'OA',
    name: 'Operations & Algebraic Thinking',
    shortName: 'Addition & Subtraction',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'violet',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'Word problems within 100 with unknowns in every position, fluency with addition and subtraction within 20, odd and even numbers, and rectangular arrays as repeated addition — the groundwork for multiplication in Grade 3.',
    standards: [
      {
        code: 'NC.2.OA.1',
        domainId: 'OA',
        title: 'Add & Subtract Word Problems within 100',
        description: 'Represent and solve addition and subtraction word problems, within 100, with unknowns in all positions, by using representations and equations with a symbol for the unknown number to represent the problem.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'One-step problems: Add to/Take from-Start Unknown',
          'One-step problems: Compare-Bigger Unknown',
          'One-step problems: Compare-Smaller Unknown',
          'Two-step problems involving single digits: Add to/Take from-Change Unknown',
          'Two-step problems involving single digits: Add to/Take From-Result Unknown'
        ]
      },
      {
        code: 'NC.2.OA.2',
        domainId: 'OA',
        title: 'Fluency with Addition & Subtraction within 20',
        description: 'Demonstrate fluency with addition and subtraction, within 20, using mental strategies.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Mental strategies rather than counting one by one',
          'Addition and subtraction facts within 20',
          'Fluency: accurate, efficient, and flexible recall'
        ]
      },
      {
        code: 'NC.2.OA.3',
        domainId: 'OA',
        title: 'Odd & Even Numbers',
        description: 'Determine whether a group of objects, within 20, has an odd or even number of members.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Pairing objects, then counting them by 2s',
          'Determining whether objects can be placed into two equal groups',
          'Writing an equation to express an even number as a sum of two equal addends'
        ]
      },
      {
        code: 'NC.2.OA.4',
        domainId: 'OA',
        title: 'Rectangular Arrays as Repeated Addition',
        description: 'Use addition to find the total number of objects arranged in rectangular arrays with up to 5 rows and up to 5 columns; write an equation to express the total as a sum of equal addends.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Arrays with up to 5 rows and up to 5 columns',
          'Finding the total by adding, not by counting every object',
          'Writing an equation expressing the total as a sum of equal addends'
        ]
      }
    ]
  },
  {
    id: 'NBT',
    name: 'Number & Operations in Base Ten',
    shortName: 'Place Value to 1,000',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'The largest Grade 2 domain by standard count. Hundreds, tens and ones; counting and skip-counting within 1,000; reading, writing and comparing three-digit numbers; and adding and subtracting within 1,000.',
    standards: [
      {
        code: 'NC.2.NBT.1',
        domainId: 'NBT',
        title: 'Hundreds, Tens & Ones',
        description: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Unitize by making a hundred from a collection of ten tens',
          'Demonstrate that the numbers 100, 200, 300, 400, 500, 600, 700, 800, 900 refer to one, two, three, four, five, six, seven, eight, or nine hundreds, with 0 tens and 0 ones',
          'Compose and decompose numbers using various groupings of hundreds, tens, and ones'
        ]
      },
      {
        code: 'NC.2.NBT.2',
        domainId: 'NBT',
        title: 'Count & Skip-Count within 1,000',
        description: 'Count within 1000; skip-count by 5s, 10s, and 100s.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Counting within 1,000',
          'Skip-counting by 5s',
          'Skip-counting by 10s and 100s'
        ]
      },
      {
        code: 'NC.2.NBT.3',
        domainId: 'NBT',
        title: 'Read & Write Numbers within 1,000',
        description: 'Read and write numbers, within 1000, using base-ten numerals, number names, and expanded form.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Base-ten numerals (standard form)',
          'Number names (word form)',
          'Expanded form'
        ]
      },
      {
        code: 'NC.2.NBT.4',
        domainId: 'NBT',
        title: 'Compare Three-Digit Numbers',
        description: 'Compare two three-digit numbers based on the value of the hundreds, tens, and ones digits, using >, =, and < symbols to record the results of comparisons.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Compare using the value of the hundreds, tens, and ones digits',
          'Record the results with the >, =, and < symbols',
          'Comparing place by place rather than by digit count alone'
        ]
      },
      {
        code: 'NC.2.NBT.5',
        domainId: 'NBT',
        title: 'Fluency with Addition & Subtraction within 100',
        description: 'Demonstrate fluency with addition and subtraction, within 100.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Flexibly using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction',
          'Comparing addition and subtraction strategies, and explaining why they work',
          'Selecting an appropriate strategy in order to efficiently compute sums and differences'
        ]
      },
      {
        code: 'NC.2.NBT.6',
        domainId: 'NBT',
        title: 'Add Up to Three Two-Digit Numbers',
        description: 'Add up to three two-digit numbers using strategies based on place value and properties of operations.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Adding three two-digit numbers in one problem',
          'Strategies based on place value',
          'Properties of operations, such as adding in a convenient order'
        ]
      },
      {
        code: 'NC.2.NBT.7',
        domainId: 'NBT',
        title: 'Add & Subtract within 1,000',
        description: 'Add and subtract, within 1000, relating the strategy to a written method.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Concrete models or drawings',
          'Strategies based on place value',
          'Properties of operations',
          'Relationship between addition and subtraction'
        ]
      },
      {
        code: 'NC.2.NBT.8',
        domainId: 'NBT',
        title: 'Mentally Add or Subtract 10 and 100',
        description: 'Mentally add 10 or 100 to a given number 100–900, and mentally subtract 10 or 100 from a given number 100–900.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Adding 10 or 100 mentally, without counting on',
          'Subtracting 10 or 100 mentally',
          'Numbers in the range 100–900'
        ]
      }
    ]
  },
  {
    id: 'MD',
    name: 'Measurement & Data',
    shortName: 'Measurement, Time & Money',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Measuring length with standard tools and units, relating addition and subtraction to length, telling time to the nearest five minutes, solving money problems with coins and dollars, and reading picture and bar graphs.',
    standards: [
      {
        code: 'NC.2.MD.1',
        domainId: 'MD',
        title: 'Measure Length with Standard Tools',
        description: 'Measure the length of an object in standard units by selecting and using appropriate tools such as rulers, yardsticks, meter sticks, and measuring tapes.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Rulers, yardsticks, meter sticks, and measuring tapes',
          'Choosing the tool that suits the object being measured',
          'Measuring in standard units rather than non-standard ones'
        ]
      },
      {
        code: 'NC.2.MD.2',
        domainId: 'MD',
        title: 'Measure with Two Different Units',
        description: 'Measure the length of an object twice, using length units of different lengths for the two measurements; describe how the two measurements relate to the size of the unit chosen.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Measuring the same object with two different-sized units',
          'Describing how the two measurements relate to the size of the unit chosen',
          'A smaller unit gives a larger count for the same length'
        ]
      },
      {
        code: 'NC.2.MD.3',
        domainId: 'MD',
        title: 'Estimate Lengths in Standard Units',
        description: 'Estimate lengths using standard units of inches, feet, yards, centimeters, and meters.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Estimating in inches, feet, and yards',
          'Estimating in centimeters and meters',
          'Building a mental benchmark for each unit'
        ]
      },
      {
        code: 'NC.2.MD.4',
        domainId: 'MD',
        title: 'Compare Lengths of Two Objects',
        description: 'Measure to determine how much longer one object is than another, expressing the length difference in terms of a standard length unit.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Measuring both objects before comparing',
          'Expressing the difference in a standard length unit',
          'How much longer as a subtraction question'
        ]
      },
      {
        code: 'NC.2.MD.5',
        domainId: 'MD',
        title: 'Length Word Problems within 100',
        description: 'Use addition and subtraction, within 100, to solve word problems involving lengths that are given in the same units, using equations with a symbol for the unknown number to represent the problem.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Lengths given in the same units within one problem',
          'Equations with a symbol standing for the unknown number',
          'Represent whole numbers as lengths from 0 on a number line diagram with equally spaced points and represent whole-number sums and differences, within 100, on a number line'
        ]
      },
      {
        code: 'NC.2.MD.6',
        domainId: 'MD',
        title: 'Whole Numbers as Lengths on a Number Line',
        description: 'Represent whole numbers as lengths from 0 on a number line diagram with equally spaced points and represent whole-number sums and differences, within 100, on a number line.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Whole numbers as lengths measured from 0',
          'Number line diagrams with equally spaced points',
          'Showing sums and differences within 100 as jumps on the line'
        ]
      },
      {
        code: 'NC.2.MD.7',
        domainId: 'MD',
        title: 'Tell Time to Five Minutes (a.m. & p.m.)',
        description: 'Tell and write time from analog and digital clocks to the nearest five minutes, using a.m. and p.m.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Analog and digital clocks',
          'Time to the nearest five minutes',
          'Using a.m. and p.m. correctly'
        ]
      },
      {
        code: 'NC.2.MD.8',
        domainId: 'MD',
        title: 'Money Word Problems: Coins & Dollars',
        description: 'Solve word problems involving money.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Quarters, dimes, nickels, and pennies within 99¢, using ¢ symbols appropriately',
          'Whole dollar amounts, using the $ symbol appropriately'
        ]
      },
      {
        code: 'NC.2.MD.10',
        domainId: 'MD',
        title: 'Picture Graphs & Bar Graphs',
        description: 'Organize, represent, and interpret data with up to four categories.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Draw a picture graph and a bar graph with a single-unit scale to represent a data set',
          'Solve simple put-together, take-apart, and compare problems using information presented in a picture and a bar graph'
        ]
      }
    ]
  },
  {
    id: 'G',
    name: 'Geometry',
    shortName: 'Shapes & Equal Shares',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'rose',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Recognizing and drawing shapes from their attributes, describing rectangular prisms and cubes, and partitioning circles and rectangles into halves, thirds, and fourths.',
    standards: [
      {
        code: 'NC.2.G.1',
        domainId: 'G',
        title: 'Recognize & Draw Shapes by Attributes',
        description: 'Recognize and draw triangles, quadrilaterals, pentagons, and hexagons, having specified attributes; recognize and describe attributes of rectangular prisms and cubes.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Triangles, quadrilaterals, pentagons, and hexagons',
          'Drawing a shape to match specified attributes',
          'Attributes of rectangular prisms and cubes'
        ]
      },
      {
        code: 'NC.2.G.3',
        domainId: 'G',
        title: 'Partition Circles & Rectangles into Equal Shares',
        description: 'Partition circles and rectangles into two, three, or four equal shares.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Describe the shares using the words halves, thirds, half of, a third of, fourths, fourth of, quarter of',
          'Describe the whole as two halves, three thirds, four fourths',
          'Explain that equal shares of identical wholes need not have the same shape'
        ]
      }
    ]
  }
];

// Helper to look up a standard by its code
export const GRADE_2_STANDARDS: StandardInfo[] = GRADE_2_DOMAINS.flatMap(d => d.standards);

export function getStandardByCode(code: string): StandardInfo | undefined {
  return GRADE_2_STANDARDS.find(s => s.code === code);
}

export function getDomainById(id: string): DomainInfo | undefined {
  return GRADE_2_DOMAINS.find(d => d.id === id);
}
