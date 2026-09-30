import type { DomainInfo, StandardInfo } from '../types';


export const GRADE_3_DOMAINS: DomainInfo[] = [
  {
    id: 'OA',
    name: 'Operations & Algebraic Thinking',
    shortName: 'Multiplication & Division',
    parentName: 'Multiplying & dividing',
    officialWeightRange: '32–36%',
    officialWeightMidpoint: 34,
    color: 'violet',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'The highest-weighted domain on the NC Grade 3 assessment. Grade 3 is where multiplication and division begin: interpreting factors and quotients, solving one- and two-step problems, building fluency to 10 × 10, and reading patterns in the multiplication table.',
    standards: [
      {
        code: 'NC.3.OA.1',
        domainId: 'OA',
        title: 'Understand Multiplication as Equal Groups',
        description: 'Interpret products of whole numbers with two factors up to and including 10.',
        weightCategory: 'Highest Priority (OA band 32–36%)',
        keyConcepts: [
          'Interpret the factors as representing the number of equal groups and the number of objects in each group',
          'Illustrate and explain strategies including arrays, repeated addition, decomposing a factor, and applying the commutative and associative properties'
        ]
      },
      {
        code: 'NC.3.OA.2',
        domainId: 'OA',
        title: 'Understand Division as Sharing into Equal Groups',
        description: 'Interpret whole-number quotients of whole numbers with a one-digit divisor and a one-digit quotient.',
        weightCategory: 'Highest Priority (OA band 32–36%)',
        keyConcepts: [
          'Interpret the divisor and quotient in a division equation as representing the number of equal groups and the number of objects in each group',
          'Illustrate and explain strategies including arrays, repeated addition or subtraction, and decomposing a factor'
        ]
      },
      {
        code: 'NC.3.OA.3',
        domainId: 'OA',
        title: 'One-Step Multiplication & Division Word Problems',
        description: 'Represent, interpret, and solve one-step problems involving multiplication and division.',
        weightCategory: 'Highest Priority (OA band 32–36%)',
        keyConcepts: [
          'Solve multiplication word problems with factors up to and including 10, representing the problem using arrays, pictures, and/or equations with a symbol for the unknown number',
          'Solve division word problems with a divisor and quotient up to and including 10, representing the problem using arrays, pictures, repeated subtraction and/or equations with a symbol for the unknown number'
        ]
      },
      {
        code: 'NC.3.OA.6',
        domainId: 'OA',
        title: 'Unknown-Factor Problems',
        description: 'Solve an unknown-factor problem, by using division strategies and/or changing it to a multiplication problem.',
        weightCategory: 'High Priority (OA band 32–36%)',
        keyConcepts: [
          'Division strategies applied to an unknown factor',
          'Rewriting an unknown-factor problem as a multiplication problem',
          'Multiplication and division as inverse operations'
        ]
      },
      {
        code: 'NC.3.OA.7',
        domainId: 'OA',
        title: 'Fluency with Multiplication & Division to 10',
        description: 'Demonstrate fluency with multiplication and division with factors, quotients and divisors up to and including 10.',
        weightCategory: 'Highest Priority (OA band 32–36%)',
        keyConcepts: [
          'Know from memory all products with factors up to and including 10',
          'Illustrate and explain using the relationship between multiplication and division',
          'Determine the unknown whole number in a multiplication or division equation relating three whole numbers'
        ]
      },
      {
        code: 'NC.3.OA.8',
        domainId: 'OA',
        title: 'Two-Step Word Problems',
        description: 'Solve two-step word problems using addition, subtraction, and multiplication, representing problems using equations with a symbol for the unknown number.',
        weightCategory: 'High Priority (OA band 32–36%)',
        keyConcepts: [
          'Two-step problems using addition, subtraction, and multiplication',
          'Writing equations with a symbol standing for the unknown number',
          'Keeping track of the result of the first step before taking the second'
        ]
      },
      {
        code: 'NC.3.OA.9',
        domainId: 'OA',
        title: 'Patterns in the Multiplication Table',
        description: 'Interpret patterns of multiplication on a hundreds board and/or multiplication table.',
        weightCategory: 'Core (OA band 32–36%)',
        keyConcepts: [
          'Patterns of multiplication on a hundreds board',
          'Patterns of multiplication on a multiplication table',
          'Interpreting, not just spotting, the pattern found'
        ]
      }
    ]
  },
  {
    id: 'NF',
    name: 'Number & Operations — Fractions',
    shortName: 'Introduction to Fractions',
    parentName: 'Fractions',
    officialWeightRange: '28–32%',
    officialWeightMidpoint: 30,
    color: 'emerald',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Grade 3 is the first year fractions are treated as numbers. Covers unit fractions, fractions on area and length models, equivalence, and comparing fractions with denominators of 2, 3, 4, 6, and 8.',
    standards: [
      {
        code: 'NC.3.NF.1',
        domainId: 'NF',
        title: 'Understand Unit Fractions',
        description: 'Interpret unit fractions with denominators of 2, 3, 4, 6, and 8 as quantities formed when a whole is partitioned into equal parts.',
        weightCategory: 'High Priority (NF band 28–32%)',
        keyConcepts: [
          'Explain that a unit fraction is one of those parts',
          'Represent and identify unit fractions using area and length models',
          'The whole is partitioned into equal parts'
        ]
      },
      {
        code: 'NC.3.NF.2',
        domainId: 'NF',
        title: 'Fractions on Area & Length Models',
        description: 'Interpret fractions with denominators of 2, 3, 4, 6, and 8 using area and length models.',
        weightCategory: 'High Priority (NF band 28–32%)',
        keyConcepts: [
          'Using an area model, explain that the numerator of a fraction represents the number of equal parts of the unit fraction',
          'Using a number line, explain that the numerator of a fraction represents the number of lengths of the unit fraction from 0'
        ]
      },
      {
        code: 'NC.3.NF.3',
        domainId: 'NF',
        title: 'Equivalent Fractions with Models',
        description: 'Represent equivalent fractions with area and length models.',
        weightCategory: 'High Priority (NF band 28–32%)',
        keyConcepts: [
          'Composing and decomposing fractions into equivalent fractions using related fractions: halves, fourths and eighths; thirds and sixths',
          'Explaining that a fraction with the same numerator and denominator equals one whole',
          'Expressing whole numbers as fractions, and recognizing fractions that are equivalent to whole numbers'
        ]
      },
      {
        code: 'NC.3.NF.4',
        domainId: 'NF',
        title: 'Compare Fractions with the Same Numerator or Denominator',
        description: 'Compare two fractions with the same numerator or the same denominator by reasoning about their size, using area and length models, and using the >, <, and = symbols. Recognize that comparisons are valid only when the two fractions refer to the same whole with denominators: halves, fourths and eighths; thirds and sixths.',
        weightCategory: 'High Priority (NF band 28–32%)',
        keyConcepts: [
          'Compare fractions with the same numerator, or with the same denominator',
          'Reason about their size using area and length models',
          'Record comparisons with the >, <, and = symbols',
          'Comparisons are valid only when the two fractions refer to the same whole'
        ]
      }
    ]
  },
  {
    id: 'MD',
    name: 'Measurement & Data',
    shortName: 'Measurement, Area & Perimeter',
    parentName: 'Measuring, area & perimeter',
    officialWeightRange: '23–27%',
    officialWeightMidpoint: 25,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Weighted by NCDPI together with Geometry as a single band. Covers time to the nearest minute, customary measurement, scaled picture and bar graphs, and the introduction of area and perimeter.',
    standards: [
      {
        code: 'NC.3.MD.1',
        domainId: 'MD',
        title: 'Time to the Nearest Minute & Time Intervals',
        description: 'Tell and write time to the nearest minute. Solve word problems involving addition and subtraction of time intervals within the same hour.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Tell and write time to the nearest minute',
          'Add and subtract time intervals within the same hour',
          'Word problems set in real contexts'
        ]
      },
      {
        code: 'NC.3.MD.2',
        domainId: 'MD',
        title: 'Customary Measurement: Length, Weight & Capacity',
        description: 'Solve problems involving customary measurement.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Estimate and measure lengths in customary units to the quarter-inch and half-inch, and feet and yards to the whole unit',
          'Estimate and measure capacity and weight in customary units to a whole number: cups, pints, quarts, gallons, ounces, and pounds',
          'Add, subtract, multiply, or divide to solve one-step word problems involving whole number measurements of length, weight, and capacity in the same customary units'
        ]
      },
      {
        code: 'NC.3.MD.3',
        domainId: 'MD',
        title: 'Scaled Picture & Bar Graphs',
        description: 'Represent and interpret scaled picture and bar graphs.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Collect data by asking a question that yields data in up to four categories',
          'Make a representation of data and interpret data in a frequency table, scaled picture graph, and/or scaled bar graph with axes provided',
          'Solve one and two-step “how many more” and “how many less” problems using information from these graphs'
        ]
      },
      {
        code: 'NC.3.MD.5',
        domainId: 'MD',
        title: 'Area by Tiling with Unit Squares',
        description: 'Find the area of a rectangle with whole-number side lengths by tiling without gaps or overlaps and counting unit squares.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Tiling a rectangle without gaps or overlaps',
          'Counting unit squares to find area',
          'Rectangles with whole-number side lengths'
        ]
      },
      {
        code: 'NC.3.MD.7',
        domainId: 'MD',
        title: 'Relate Area to Multiplication & Addition',
        description: 'Relate area to the operations of multiplication and addition.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Find the area of a rectangle with whole-number side lengths by tiling it, and show that the area is the same as would be found by multiplying the side lengths',
          'Multiply side lengths to find areas of rectangles with whole-number side lengths in the context of solving problems, and represent whole-number products as rectangular areas in mathematical reasoning',
          'Use tiles and/or arrays to illustrate and explain that the area of a rectangle can be found by partitioning it into two smaller rectangles, and that the area of the large rectangle is the sum of the two smaller rectangles'
        ]
      },
      {
        code: 'NC.3.MD.8',
        domainId: 'MD',
        title: 'Perimeter of Polygons',
        description: 'Solve problems involving perimeters of polygons, including finding the perimeter given the side lengths, and finding an unknown side length.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Find the perimeter of a polygon given its side lengths',
          'Find an unknown side length given the perimeter',
          'Perimeter as a total distance around a figure, distinct from area'
        ]
      }
    ]
  },
  {
    id: 'G',
    name: 'Geometry',
    shortName: 'Shapes & Quadrilaterals',
    parentName: 'Shapes',
    officialWeightRange: '23–27%',
    officialWeightMidpoint: 25,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'rose',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Weighted by NCDPI together with Measurement & Data as a single band. A single Grade 3 standard: reasoning about two-dimensional shapes, composing and decomposing them, and recognizing the types of quadrilaterals.',
    standards: [
      {
        code: 'NC.3.G.1',
        domainId: 'G',
        title: 'Reason with Two-Dimensional Shapes',
        description: 'Reason with two-dimensional shapes and their attributes.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Investigate, describe, and reason about composing triangles and quadrilaterals and decomposing quadrilaterals',
          'Recognize and draw examples and non-examples of types of quadrilaterals including rhombuses, rectangles, squares, parallelograms, and trapezoids'
        ]
      }
    ]
  },
  {
    id: 'NBT',
    name: 'Number & Operations in Base Ten',
    shortName: 'Base Ten to 1,000',
    parentName: 'Place value & rounding',
    officialWeightRange: '9–13%',
    officialWeightMidpoint: 11,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'The lowest-weighted domain at Grade 3, though not the smallest by standard count. Covers addition and subtraction within 1,000 and multiplying a one-digit number by a multiple of 10.',
    standards: [
      {
        code: 'NC.3.NBT.2',
        domainId: 'NBT',
        title: 'Add & Subtract within 1,000',
        description: 'Add and subtract whole numbers up to and including 1,000.',
        weightCategory: 'Supporting (NBT band 9–13%)',
        keyConcepts: [
          'Use estimation strategies to assess reasonableness of answers',
          'Model and explain how the relationship between addition and subtraction can be applied to solve addition and subtraction problems',
          'Use expanded form to decompose numbers and then find sums and differences'
        ]
      },
      {
        code: 'NC.3.NBT.3',
        domainId: 'NBT',
        title: 'Multiply One-Digit Numbers by Multiples of 10',
        description: 'Use concrete and pictorial models, based on place value and the properties of operations, to find the product of a one-digit whole number by a multiple of 10 in the range 10–90.',
        weightCategory: 'Supporting (NBT band 9–13%)',
        keyConcepts: [
          'Concrete and pictorial models for the product',
          'Place value and the properties of operations as the reasoning behind it',
          'Multiples of 10 in the range 10–90'
        ]
      }
    ]
  }
];

// Helper to look up a standard by its code
export const GRADE_3_STANDARDS: StandardInfo[] = GRADE_3_DOMAINS.flatMap(d => d.standards);

export function getStandardByCode(code: string): StandardInfo | undefined {
  return GRADE_3_STANDARDS.find(s => s.code === code);
}

export function getDomainById(id: string): DomainInfo | undefined {
  return GRADE_3_DOMAINS.find(d => d.id === id);
}
