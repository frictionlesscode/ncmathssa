import type { DomainInfo, StandardInfo } from '../types';


export const GRADE_4_DOMAINS: DomainInfo[] = [
  {
    id: 'NF',
    name: 'Number & Operations — Fractions',
    shortName: 'Fractions & Decimals',
    officialWeightRange: '30–34%',
    officialWeightMidpoint: 32,
    color: 'emerald',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'The highest-weighted domain on the NC Grade 4 assessment. Covers fraction equivalence and comparison, decomposing and adding fractions with like denominators, multiplying a fraction by a whole number, and decimal notation for tenths and hundredths.',
    standards: [
      {
        code: 'NC.4.NF.1',
        domainId: 'NF',
        title: 'Explain Fraction Equivalence with Models',
        description: 'Explain why a fraction is equivalent to another fraction by using area and length fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size.',
        weightCategory: 'Highest Priority (NF band 30–34%)',
        keyConcepts: [
          'Area and length fraction models as the justification for equivalence',
          'The number of parts and the size of the parts both change between equivalent fractions',
          'Two equivalent fractions are the same size even though they are partitioned differently'
        ]
      },
      {
        code: 'NC.4.NF.2',
        domainId: 'NF',
        title: 'Compare Fractions with Unlike Numerators & Denominators',
        description: 'Compare two fractions with different numerators and different denominators, using the denominators 2, 3, 4, 5, 6, 8, 10, 12, and 100. Recognize that comparisons are valid only when the two fractions refer to the same whole. Record the results of comparisons with symbols >, =, or <, and justify the conclusions.',
        weightCategory: 'Highest Priority (NF band 30–34%)',
        keyConcepts: [
          'Reasoning about their size and using area and length models',
          'Using benchmark fractions 0, ½, and a whole',
          'Comparing common numerator or common denominators'
        ]
      },
      {
        code: 'NC.4.NF.3',
        domainId: 'NF',
        title: 'Decompose, Add & Subtract Fractions with Like Denominators',
        description: 'Understand and justify decompositions of fractions with denominators of 2, 3, 4, 5, 6, 8, 10, 12, and 100.',
        weightCategory: 'Highest Priority (NF band 30–34%)',
        keyConcepts: [
          'Understand addition and subtraction of fractions as joining and separating parts referring to the same whole',
          'Decompose a fraction into a sum of unit fractions, and into a sum of fractions with the same denominator, in more than one way using area models, length models, and equations',
          'Add and subtract fractions, including mixed numbers with like denominators, by replacing each mixed number with an equivalent fraction, and/or by using properties of operations and the relationship between addition and subtraction',
          'Solve word problems involving addition and subtraction of fractions, including mixed numbers, by writing equations from a visual representation of the problem'
        ]
      },
      {
        code: 'NC.4.NF.4',
        domainId: 'NF',
        title: 'Multiply a Fraction by a Whole Number',
        description: 'Apply and extend previous understandings of multiplication to fractions.',
        weightCategory: 'High Priority (NF band 30–34%)',
        keyConcepts: [
          'Model and explain how fractions can be represented by multiplying a whole number by a unit fraction, using this understanding to multiply a whole number by any fraction less than one',
          'Solve word problems involving multiplication of a fraction by a whole number'
        ]
      },
      {
        code: 'NC.4.NF.6',
        domainId: 'NF',
        title: 'Decimal Notation for Tenths & Hundredths',
        description: 'Use decimal notation to represent fractions.',
        weightCategory: 'High Priority (NF band 30–34%)',
        keyConcepts: [
          'Express, model and explain the equivalence between fractions with denominators of 10 and 100',
          'Use equivalent fractions to add two fractions with denominators of 10 or 100',
          'Represent tenths and hundredths with models, making connections between fractions and decimals'
        ]
      },
      {
        code: 'NC.4.NF.7',
        domainId: 'NF',
        title: 'Compare Decimals to Hundredths',
        description: 'Compare two decimals to hundredths by reasoning about their size using area and length models, and recording the results of comparisons with the symbols >, =, or <. Recognize that comparisons are valid only when the two decimals refer to the same whole.',
        weightCategory: 'High Priority (NF band 30–34%)',
        keyConcepts: [
          'Reason about the size of two decimals using area and length models',
          'Record the results of comparisons with the symbols >, =, or <',
          'Comparisons are valid only when the two decimals refer to the same whole'
        ]
      }
    ]
  },
  {
    id: 'NBT',
    name: 'Number & Operations in Base Ten',
    shortName: 'Base Ten & Whole Numbers',
    officialWeightRange: '25–29%',
    officialWeightMidpoint: 27,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'The second largest domain at Grade 4. Covers place value to 100,000, reading, writing and comparing multi-digit numbers, the standard addition and subtraction algorithm, multi-digit multiplication, and division with one-digit divisors.',
    standards: [
      {
        code: 'NC.4.NBT.1',
        domainId: 'NBT',
        title: 'Place Value: 10 Times as Much',
        description: 'Explain that in a multi-digit whole number, a digit in one place represents 10 times as much as it represents in the place to its right, up to 100,000.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'A digit in one place represents 10 times as much as it represents in the place to its right',
          'Explaining the relationship between adjacent places, not only naming them',
          'Whole numbers up to and including 100,000'
        ]
      },
      {
        code: 'NC.4.NBT.2',
        domainId: 'NBT',
        title: 'Read & Write Numbers to 100,000',
        description: 'Read and write multi-digit whole numbers up to and including 100,000 using numerals, number names, and expanded form.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Numerals (standard form)',
          'Number names (word form)',
          'Expanded form',
          'Whole numbers up to and including 100,000'
        ]
      },
      {
        code: 'NC.4.NBT.7',
        domainId: 'NBT',
        title: 'Compare Multi-Digit Numbers to 100,000',
        description: 'Compare two multi-digit numbers up to and including 100,000 based on the values of the digits in each place, using >, =, and < symbols to record the results of comparisons.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Compare based on the value of the digits in each place',
          'Record the results of comparisons with >, =, and < symbols',
          'Whole numbers up to and including 100,000'
        ]
      },
      {
        code: 'NC.4.NBT.4',
        domainId: 'NBT',
        title: 'Add & Subtract Multi-Digit Numbers (Standard Algorithm)',
        description: 'Add and subtract multi-digit whole numbers up to and including 100,000 using the standard algorithm with place value understanding.',
        weightCategory: 'High Priority (NBT band 25–29%)',
        keyConcepts: [
          'The standard algorithm for addition and subtraction',
          'Place value understanding behind regrouping',
          'Whole numbers up to and including 100,000'
        ]
      },
      {
        code: 'NC.4.NBT.5',
        domainId: 'NBT',
        title: 'Multiply Multi-Digit Whole Numbers',
        description: 'Multiply a whole number of up to three digits by a one-digit whole number, and multiply up to two two-digit numbers with place value understanding using area models, partial products, and the properties of operations. Use models to make connections and develop the algorithm.',
        weightCategory: 'High Priority (NBT band 25–29%)',
        keyConcepts: [
          'Up to three digits multiplied by a one-digit whole number',
          'Two two-digit numbers multiplied together',
          'Area models, partial products, and the properties of operations',
          'Using models to make connections and develop the algorithm'
        ]
      },
      {
        code: 'NC.4.NBT.6',
        domainId: 'NBT',
        title: 'Divide by One-Digit Divisors with Remainders',
        description: 'Find whole-number quotients and remainders with up to three-digit dividends and one-digit divisors with place value understanding using rectangular arrays, area models, repeated subtraction, partial quotients, properties of operations, and/or the relationship between multiplication and division.',
        weightCategory: 'High Priority (NBT band 25–29%)',
        keyConcepts: [
          'Whole-number quotients and remainders, up to three-digit dividends',
          'Rectangular arrays, area models, and repeated subtraction',
          'Partial quotients and the properties of operations',
          'The relationship between multiplication and division'
        ]
      }
    ]
  },
  {
    id: 'MD',
    name: 'Measurement & Data',
    shortName: 'Measurement & Angles',
    officialWeightRange: '23–27%',
    officialWeightMidpoint: 25,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Weighted by NCDPI together with Geometry as a single band. Covers metric measurement and conversion, time intervals that cross the hour, area and perimeter problems, representing data, and measuring angles with a protractor.',
    standards: [
      {
        code: 'NC.4.MD.1',
        domainId: 'MD',
        title: 'Metric Measurement & Relative Unit Sizes',
        description: 'Know relative sizes of measurement units. Solve problems involving metric measurement.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Measure to solve problems involving metric units: centimeter, meter, gram, kilogram, liter, milliliter',
          'Add, subtract, multiply, and divide to solve one-step word problems involving whole-number measurements of length, mass, and capacity that are given in metric units'
        ]
      },
      {
        code: 'NC.4.MD.2',
        domainId: 'MD',
        title: 'Convert Metric Units (Larger to Smaller)',
        description: 'Use multiplicative reasoning to convert metric measurements from a larger unit to a smaller unit using place value understanding, two-column tables, and length models.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Multiplicative reasoning when converting a larger unit to a smaller unit',
          'Place value understanding applied to metric conversion',
          'Two-column conversion tables',
          'Length models'
        ]
      },
      {
        code: 'NC.4.MD.8',
        domainId: 'MD',
        title: 'Time Intervals That Cross the Hour',
        description: 'Solve word problems involving addition and subtraction of time intervals that cross the hour.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Addition and subtraction of time intervals',
          'Intervals that cross from one hour into the next',
          'Word problems set in real contexts'
        ]
      },
      {
        code: 'NC.4.MD.3',
        domainId: 'MD',
        title: 'Area & Perimeter Problems',
        description: 'Solve problems with area and perimeter.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Find areas of rectilinear figures with known side lengths',
          'Solve problems involving a fixed area and varying perimeters, and a fixed perimeter and varying areas',
          'Apply the area and perimeter formulas for rectangles in real world and mathematical problems'
        ]
      },
      {
        code: 'NC.4.MD.4',
        domainId: 'MD',
        title: 'Represent & Interpret Data',
        description: 'Represent and interpret data using whole numbers.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Collect data by asking a question that yields numerical data',
          'Make a representation of data and interpret data in a frequency table, scaled bar graph, and/or line plot',
          'Determine whether a survey question will yield categorical or numerical data'
        ]
      },
      {
        code: 'NC.4.MD.6',
        domainId: 'MD',
        title: 'Angles & Measuring with a Protractor',
        description: 'Develop an understanding of angles and angle measurement.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Understand angles as geometric shapes that are formed wherever two rays share a common endpoint, and are measured in degrees',
          'Measure and sketch angles in whole-number degrees using a protractor',
          'Solve addition and subtraction problems to find unknown angles on a diagram in real-world and mathematical problems'
        ]
      }
    ]
  },
  {
    id: 'G',
    name: 'Geometry',
    shortName: 'Lines, Angles & Symmetry',
    officialWeightRange: '23–27%',
    officialWeightMidpoint: 25,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'rose',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Weighted by NCDPI together with Measurement & Data as a single band. Covers points, lines, rays and angles, classifying triangles and quadrilaterals, and lines of symmetry.',
    standards: [
      {
        code: 'NC.4.G.1',
        domainId: 'G',
        title: 'Points, Lines, Rays & Angles',
        description: 'Draw and identify points, lines, line segments, rays, angles, and perpendicular and parallel lines.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Points, lines, and line segments',
          'Rays and the angles they form',
          'Perpendicular lines',
          'Parallel lines'
        ]
      },
      {
        code: 'NC.4.G.2',
        domainId: 'G',
        title: 'Classify Triangles & Quadrilaterals',
        description: 'Classify quadrilaterals and triangles based on angle measure, side lengths, and the presence or absence of parallel or perpendicular lines.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Classify by angle measure',
          'Classify by side lengths',
          'Presence or absence of parallel lines',
          'Presence or absence of perpendicular lines'
        ]
      },
      {
        code: 'NC.4.G.3',
        domainId: 'G',
        title: 'Lines of Symmetry',
        description: 'Recognize symmetry in a two-dimensional figure, and identify and draw lines of symmetry.',
        weightCategory: 'Core (MD & G share 23–27%)',
        keyConcepts: [
          'Recognize symmetry in a two-dimensional figure',
          'Identify lines of symmetry',
          'Draw lines of symmetry'
        ]
      }
    ]
  },
  {
    id: 'OA',
    name: 'Operations & Algebraic Thinking',
    shortName: 'Algebraic Thinking',
    officialWeightRange: '14–18%',
    officialWeightMidpoint: 16,
    color: 'violet',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'Covers multiplicative comparison, two-step word problems using all four operations, factor pairs with prime and composite numbers, and generating number and shape patterns from a rule.',
    standards: [
      {
        code: 'NC.4.OA.1',
        domainId: 'OA',
        title: 'Multiplicative Comparison Word Problems',
        description: 'Interpret a multiplication equation as a comparison. Multiply or divide to solve word problems involving multiplicative comparisons using models and equations with a symbol for the unknown number. Distinguish multiplicative comparison from additive comparison.',
        weightCategory: 'Supporting (OA band 14–18%)',
        keyConcepts: [
          'Interpret a multiplication equation as a comparison',
          'Multiply or divide to solve multiplicative comparison word problems',
          'Models and equations with a symbol for the unknown number',
          'Distinguish multiplicative comparison from additive comparison'
        ]
      },
      {
        code: 'NC.4.OA.3',
        domainId: 'OA',
        title: 'Two-Step Word Problems, All Four Operations',
        description: 'Solve two-step word problems involving the four operations with whole numbers.',
        weightCategory: 'Supporting (OA band 14–18%)',
        keyConcepts: [
          'Use estimation strategies to assess reasonableness of answers',
          'Interpret remainders in word problems',
          'Represent problems using equations with a letter standing for the unknown quantity'
        ]
      },
      {
        code: 'NC.4.OA.4',
        domainId: 'OA',
        title: 'Factor Pairs, Multiples, Prime & Composite',
        description: 'Find all factor pairs for whole numbers up to and including 50.',
        weightCategory: 'Supporting (OA band 14–18%)',
        keyConcepts: [
          'Recognize that a whole number is a multiple of each of its factors',
          'Determine whether a given whole number is a multiple of a given one-digit number',
          'Determine if the number is prime or composite'
        ]
      },
      {
        code: 'NC.4.OA.5',
        domainId: 'OA',
        title: 'Generate & Analyze Patterns',
        description: 'Generate and analyze a number or shape pattern that follows a given rule.',
        weightCategory: 'Supporting (OA band 14–18%)',
        keyConcepts: [
          'Generate a number pattern that follows a given rule',
          'Generate a shape pattern that follows a given rule',
          'Analyze the pattern the rule produces'
        ]
      }
    ]
  }
];

// Helper to look up a standard by its code
export const GRADE_4_STANDARDS: StandardInfo[] = GRADE_4_DOMAINS.flatMap(d => d.standards);

export function getStandardByCode(code: string): StandardInfo | undefined {
  return GRADE_4_STANDARDS.find(s => s.code === code);
}

export function getDomainById(id: string): DomainInfo | undefined {
  return GRADE_4_DOMAINS.find(d => d.id === id);
}
