import type { DomainInfo, StandardInfo } from '../types';


export const GRADE_1_DOMAINS: DomainInfo[] = [
  {
    id: 'OA',
    name: 'Operations & Algebraic Thinking',
    shortName: 'Addition & Subtraction',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'violet',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'The largest Grade 1 domain by standard count. Word problems within 20, the commutative and associative properties, strategies such as making ten, fluency within 10, and what the equal sign actually means.',
    standards: [
      {
        code: 'NC.1.OA.1',
        domainId: 'OA',
        title: 'Addition & Subtraction Word Problems within 20',
        description: 'Represent and solve addition and subtraction word problems, within 20, with unknowns, by using objects, drawings, and equations with a symbol for the unknown number to represent the problem.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Add to/Take from-Change Unknown',
          'Put together/Take Apart-Addend Unknown',
          'Compare-Difference Unknown'
        ]
      },
      {
        code: 'NC.1.OA.2',
        domainId: 'OA',
        title: 'Add Three Whole Numbers',
        description: 'Represent and solve word problems that call for addition of three whole numbers whose sum is less than or equal to 20, by using objects, drawings, and equations with a symbol for the unknown number.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Three addends in a single problem',
          'Sums less than or equal to 20',
          'Objects, drawings, and equations with a symbol for the unknown number'
        ]
      },
      {
        code: 'NC.1.OA.3',
        domainId: 'OA',
        title: 'Commutative & Associative Properties',
        description: 'Apply the commutative and associative properties as strategies for solving addition problems.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Commutative property: addends can be added in any order',
          'Associative property: addends can be grouped in any way',
          'Using the properties as a strategy, not just naming them'
        ]
      },
      {
        code: 'NC.1.OA.4',
        domainId: 'OA',
        title: 'Unknown-Addend Problems',
        description: 'Solve an unknown-addend problem, within 20, by using addition strategies and/or changing it to a subtraction problem.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Addition strategies applied to an unknown addend',
          'Rewriting an unknown-addend problem as a subtraction problem',
          'Addition and subtraction as related operations'
        ]
      },
      {
        code: 'NC.1.OA.9',
        domainId: 'OA',
        title: 'Fluency with Addition & Subtraction within 10',
        description: 'Demonstrate fluency with addition and subtraction within 10.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Addition facts within 10',
          'Subtraction facts within 10',
          'Fluency: accurate and efficient recall rather than counting'
        ]
      },
      {
        code: 'NC.1.OA.6',
        domainId: 'OA',
        title: 'Add & Subtract within 20 Using Strategies',
        description: 'Add and subtract, within 20, using strategies.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Counting on',
          'Making ten',
          'Decomposing a number leading to a ten',
          'Using the relationship between addition and subtraction',
          'Using a number line',
          'Creating equivalent but simpler or known sums'
        ]
      },
      {
        code: 'NC.1.OA.7',
        domainId: 'OA',
        title: 'The Meaning of the Equal Sign',
        description: 'Apply understanding of the equal sign to determine if equations involving addition and subtraction are true.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'The equal sign means both sides have the same value',
          'Deciding whether an equation is true or false',
          'Equations with operations on both sides'
        ]
      },
      {
        code: 'NC.1.OA.8',
        domainId: 'OA',
        title: 'Find the Unknown Number in an Equation',
        description: 'Determine the unknown whole number in an addition or subtraction equation involving three whole numbers.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Equations relating three whole numbers',
          'The unknown can be in any position',
          'Addition and subtraction equations alike'
        ]
      }
    ]
  },
  {
    id: 'NBT',
    name: 'Number & Operations in Base Ten',
    shortName: 'Tens & Ones',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Counting to 150, reading and writing numerals to 100, understanding a two-digit number as tens and ones, comparing two-digit numbers, and adding and subtracting with multiples of 10.',
    standards: [
      {
        code: 'NC.1.NBT.1',
        domainId: 'NBT',
        title: 'Count to 150 from Any Number',
        description: 'Count to 150, starting at any number less than 150.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Counting all the way to 150',
          'Starting at any number less than 150, not only at 1',
          'Continuing the counting sequence across decade boundaries'
        ]
      },
      {
        code: 'NC.1.NBT.7',
        domainId: 'NBT',
        title: 'Read & Write Numerals to 100',
        description: 'Read and write numerals, and represent a number of objects with a written numeral, to 100.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Reading numerals to 100',
          'Writing numerals to 100',
          'Representing a number of objects with a written numeral'
        ]
      },
      {
        code: 'NC.1.NBT.2',
        domainId: 'NBT',
        title: 'Tens & Ones in a Two-Digit Number',
        description: 'Understand that the two digits of a two-digit number represent amounts of tens and ones.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Unitize by making a ten from a collection of ten ones',
          'Model the numbers from 11 to 19 as composed of a ten and one, two, three, four, five, six, seven, eight, or nine ones',
          'Demonstrate that the numbers 10, 20, 30, 40, 50, 60, 70, 80, 90 refer to one, two, three, four, five, six, seven, eight, or nine tens, with 0 ones'
        ]
      },
      {
        code: 'NC.1.NBT.3',
        domainId: 'NBT',
        title: 'Compare Two-Digit Numbers',
        description: 'Compare two two-digit numbers based on the value of the tens and ones digits, recording the results of comparisons with the symbols >, =, and <.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Compare using the value of the tens digit first, then the ones',
          'Record the results with the symbols >, =, and <',
          'Two-digit numbers only'
        ]
      },
      {
        code: 'NC.1.NBT.4',
        domainId: 'NBT',
        title: 'Add within 100',
        description: 'Using concrete models or drawings, strategies based on place value, properties of operations, and explaining the reasoning used, add within 100.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'A two-digit number and a one-digit number',
          'A two-digit number and a multiple of 10',
          'Concrete models or drawings, and strategies based on place value',
          'Explaining the reasoning used'
        ]
      },
      {
        code: 'NC.1.NBT.5',
        domainId: 'NBT',
        title: 'Mentally Find 10 More or 10 Less',
        description: 'Given a two-digit number, mentally find 10 more or 10 less than the number, without having to count; explain the reasoning used.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          '10 more and 10 less, found mentally',
          'Without having to count on or back',
          'Explaining the reasoning used'
        ]
      },
      {
        code: 'NC.1.NBT.6',
        domainId: 'NBT',
        title: 'Subtract Multiples of 10',
        description: 'Subtract multiples of 10 in the range 10-90 from multiples of 10 in the range 10-90, explaining the reasoning.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Concrete models and drawings',
          'Number lines',
          'Strategies based on place value',
          'Properties of operations',
          'The relationship between addition and subtraction'
        ]
      }
    ]
  },
  {
    id: 'MD',
    name: 'Measurement & Data',
    shortName: 'Length, Time & Money',
    officialWeightRange: 'No state assessment at this grade',
    officialWeightMidpoint: 0,
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Ordering and measuring length with non-standard units, telling time to the hour and half-hour, identifying coins and relating their values to pennies, and organizing data in up to three categories.',
    standards: [
      {
        code: 'NC.1.MD.1',
        domainId: 'MD',
        title: 'Order & Compare Lengths Indirectly',
        description: 'Order three objects by length; compare the lengths of two objects indirectly by using a third object.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Ordering three objects by length',
          'Comparing two objects indirectly by using a third object',
          'Transitivity: if A is longer than B and B is longer than C, A is longer than C'
        ]
      },
      {
        code: 'NC.1.MD.2',
        domainId: 'MD',
        title: 'Measure Length with Non-Standard Units',
        description: 'Measure lengths with non-standard units.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Express the length of an object as a whole number of non-standard length units',
          'Measure by laying multiple copies of a shorter object (the length unit) end to end (iterating) with no gaps or overlaps'
        ]
      },
      {
        code: 'NC.1.MD.3',
        domainId: 'MD',
        title: 'Tell Time to the Hour & Half-Hour',
        description: 'Tell and write time in hours and half-hours using analog and digital clocks.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Time in whole hours',
          'Time in half-hours',
          'Analog and digital clocks alike'
        ]
      },
      {
        code: 'NC.1.MD.5',
        domainId: 'MD',
        title: 'Identify Coins & Relate Them to Pennies',
        description: 'Identify quarters, dimes, and nickels and relate their values to pennies.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Identifying quarters, dimes, and nickels',
          'Relating each coin value to a number of pennies',
          'The penny as the unit of value'
        ]
      },
      {
        code: 'NC.1.MD.4',
        domainId: 'MD',
        title: 'Organize & Interpret Data in Three Categories',
        description: 'Organize, represent, and interpret data with up to three categories.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Ask and answer questions about the total number of data points',
          'Ask and answer questions about how many in each category',
          'Ask and answer questions about how many more or less are in one category than in another'
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
    description: 'Distinguishing defining from non-defining attributes of shapes, building composite two- and three-dimensional shapes, and partitioning circles and rectangles into halves and fourths.',
    standards: [
      {
        code: 'NC.1.G.1',
        domainId: 'G',
        title: 'Defining & Non-Defining Attributes of Shapes',
        description: 'Distinguish between defining and non-defining attributes and create shapes with defining attributes.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Building and drawing triangles, rectangles, squares, trapezoids, hexagons, circles',
          'Building cubes, rectangular prisms, cones, spheres, and cylinders',
          'A defining attribute belongs to the shape itself, unlike a non-defining one'
        ]
      },
      {
        code: 'NC.1.G.2',
        domainId: 'G',
        title: 'Compose Two- & Three-Dimensional Shapes',
        description: 'Create composite shapes.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Making a two-dimensional composite shape using rectangles, squares, trapezoids, triangles, and half-circles, naming the components of the new shape',
          'Making a three-dimensional composite shape using cubes, rectangular prisms, cones, and cylinders, naming the components of the new shape'
        ]
      },
      {
        code: 'NC.1.G.3',
        domainId: 'G',
        title: 'Partition Shapes into Halves & Fourths',
        description: 'Partition circles and rectangles into two and four equal shares.',
        weightCategory: 'Core (no state assessment at this grade)',
        keyConcepts: [
          'Describe the shares as halves and fourths, as half of and fourth of',
          'Describe the whole as two of, or four of the shares',
          'Explain that decomposing into more equal shares creates smaller shares'
        ]
      }
    ]
  }
];

// Helper to look up a standard by its code
export const GRADE_1_STANDARDS: StandardInfo[] = GRADE_1_DOMAINS.flatMap(d => d.standards);

export function getStandardByCode(code: string): StandardInfo | undefined {
  return GRADE_1_STANDARDS.find(s => s.code === code);
}

export function getDomainById(id: string): DomainInfo | undefined {
  return GRADE_1_DOMAINS.find(d => d.id === id);
}
