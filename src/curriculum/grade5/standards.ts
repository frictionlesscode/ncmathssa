import type { DomainInfo, StandardInfo } from '../types';


export const GRADE_5_DOMAINS: DomainInfo[] = [
  {
    id: 'NF',
    name: 'Number & Operations — Fractions',
    shortName: 'Fractions Operations',
    parentName: 'Fractions',
    officialWeightRange: '39–43%',
    officialWeightMidpoint: 41,
    color: 'emerald',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'The highest-weighted domain on the NC Grade 5 assessment. Covers unlike denominator addition/subtraction, fractions as division, fraction multiplication with area models, and unit fraction division.',
    standards: [
      {
        code: 'NC.5.NF.1',
        domainId: 'NF',
        title: 'Add & Subtract Fractions with Unlike Denominators',
        description: 'Add and subtract fractions and mixed numbers with unlike (related) denominators; use benchmark estimation; solve one- and two-step real-world problems.',
        weightCategory: 'Highest Priority (NF band 39–43%)',
        keyConcepts: [
          'Finding Common Denominators using multiples',
          'Regrouping mixed numbers during subtraction (borrowing a whole)',
          'Benchmark fractions (0, 1/2, 1) for estimating reasonableness',
          'Multi-step word problems involving leftover portions'
        ]
      },
      {
        code: 'NC.5.NF.3',
        domainId: 'NF',
        title: 'Interpret Fraction as Division (a/b = a ÷ b)',
        description: 'Interpret a fraction as division of numerator by denominator; solve equal-sharing division word problems where answers are fractions or mixed numbers.',
        weightCategory: 'High Priority (NF band 39–43%)',
        keyConcepts: [
          'Fraction bar represents division: a/b = a ÷ b',
          'Equal sharing word problems (e.g. 7 lbs of food divided equally among 4 dogs = 7/4 = 1 3/4 lbs)',
          'Distinguishing dividend (what is being shared) from divisor (who is sharing)'
        ]
      },
      {
        code: 'NC.5.NF.4',
        domainId: 'NF',
        title: 'Multiply Fractions & Mixed Numbers; Area Models',
        description: 'Multiply a fraction or whole number by a fraction, including mixed numbers; use area and length models; reason about how factors affect the product.',
        weightCategory: 'Highest Priority (NF band 39–43%)',
        keyConcepts: [
          'Multiplying numerators and denominators: (a/b) × (c/d) = (a×c)/(b×d)',
          'Area of rectangles with fractional side lengths (Area = base × height)',
          'Scaling concept: multiplying by a fraction < 1 results in a smaller product; multiplying by > 1 results in a larger product',
          'Converting mixed numbers to improper fractions before multiplying'
        ]
      },
      {
        code: 'NC.5.NF.7',
        domainId: 'NF',
        title: 'Divide Unit Fractions & Whole Numbers',
        description: 'Divide unit fractions by non-zero whole numbers and whole numbers by unit fractions; solve real-world problems.',
        weightCategory: 'High Priority (NF band 39–43%)',
        keyConcepts: [
          'Dividing a whole number by a unit fraction: 4 ÷ (1/3) = 12 (how many 1/3s are in 4?)',
          'Dividing a unit fraction by a whole number: (1/3) ÷ 4 = 1/12 (sharing 1/3 among 4)',
          'Visual models: tape diagrams, number lines, and fractional parts'
        ]
      }
    ]
  },
  {
    id: 'NBT',
    name: 'Number & Operations in Base Ten',
    shortName: 'Base Ten & Decimals',
    parentName: 'Decimals & place value',
    officialWeightRange: '25–29%',
    officialWeightMidpoint: 27,
    color: 'blue',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Second largest domain. Tests place value shifts (powers of 10), reading and comparing decimals to thousandths, standard multi-digit multiplication, 2-digit division, and operations with decimals.',
    standards: [
      {
        code: 'NC.5.NBT.1',
        domainId: 'NBT',
        title: 'Place Value Patterns & Powers of 10',
        description: 'Recognize place value patterns from one million to thousandths; 10x and 1/10 relationships; patterns when multiplying or dividing by powers of 10.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'A digit in one place represents 10 times what it represents in the place to its right',
          'A digit represents 1/10 (0.1) of what it represents in the place to its left',
          'Multiplying by 10^n moves the decimal point n places to the right',
          'Dividing by 10^n moves the decimal point n places to the left'
        ]
      },
      {
        code: 'NC.5.NBT.3',
        domainId: 'NBT',
        title: 'Read, Write, and Compare Decimals to Thousandths',
        description: 'Read, write, and compare decimals to thousandths using base-ten numerals, number names, expanded form, and symbols (>, =, <).',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Standard form (e.g. 4.305), word form ("four and three hundred five thousandths")',
          'Expanded form: (4 × 1) + (3 × 0.1) + (5 × 0.001)',
          'Comparing decimals by place value from left to right',
          'Adding trailing zeros to align place values for comparison'
        ]
      },
      {
        code: 'NC.5.NBT.5',
        domainId: 'NBT',
        title: 'Fluently Multiply Multi-Digit Whole Numbers',
        description: 'Fluently multiply up to a three-digit by a two-digit number using the standard algorithm.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Standard multiplication algorithm step-by-step',
          'Placeholder zeros when multiplying by tens digit',
          'Regrouping and carrying accurately',
          'Estimation to check reasonableness of multi-digit products'
        ]
      },
      {
        code: 'NC.5.NBT.6',
        domainId: 'NBT',
        title: 'Divide Whole Numbers with 2-Digit Divisors',
        description: 'Divide up to four-digit dividends by two-digit divisors using arrays, area models, partial quotients, or relationship with multiplication.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Partial quotients and standard long division strategies',
          'Interpreting remainders in context (round up, drop, or express as fraction)',
          'Checking division with inverse multiplication: (Quotient × Divisor) + Remainder = Dividend'
        ]
      },
      {
        code: 'NC.5.NBT.7',
        domainId: 'NBT',
        title: 'Operations with Decimals to Hundredths',
        description: 'Add, subtract, multiply, and divide multi-digit whole numbers and decimals to hundredths; use estimation to check reasonableness.',
        weightCategory: 'Core (NBT band 25–29%)',
        keyConcepts: [
          'Lining up decimal points for addition and subtraction',
          'Multiplying decimals: count total decimal places in both factors',
          'Dividing decimals: shift decimal in divisor to make it whole, shift dividend by same amount',
          'Rounding and estimation to verify reasonableness'
        ]
      }
    ]
  },
  {
    id: 'MD',
    name: 'Measurement & Data',
    shortName: 'Measurement & Volume',
    parentName: 'Measurement & volume',
    officialWeightRange: '19–23%',
    officialWeightMidpoint: 21,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'amber',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Covers unit conversions (metric and customary), line plots with fractional measurements, and 3D volume concepts including additive volume of composed rectangular prisms.',
    standards: [
      {
        code: 'NC.5.MD.1',
        domainId: 'MD',
        title: 'Convert Measurement Units (Multiplicative Reasoning)',
        description: 'Convert measurement units within a given measurement system (metric and customary) using multiplicative reasoning.',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'Customary length: 12 in = 1 ft, 3 ft = 1 yd, 5,280 ft = 1 mi',
          'Customary capacity: 8 fl oz = 1 cup, 2 c = 1 pt, 2 pt = 1 qt, 4 qt = 1 gal',
          'Metric prefixes: kilo (1000), hecto (100), deka (10), base, deci (0.1), centi (0.01), milli (0.001)',
          'Larger unit to smaller unit -> multiply; Smaller unit to larger unit -> divide'
        ]
      },
      {
        code: 'NC.5.MD.2',
        domainId: 'MD',
        title: 'Represent & Interpret Data with Line Graphs & Plots',
        description: 'Represent and interpret data; line graphs; distinguish categorical vs numerical vs over-time data; solve problems with line plots displaying fractional units.',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'Line plots displaying measurements in fractions of a unit (1/8, 1/4, 1/2)',
          'Finding total sum or difference between highest and lowest data points',
          'Interpreting change over time on line graphs'
        ]
      },
      {
        code: 'NC.5.MD.4',
        domainId: 'MD',
        title: 'Volume as an Attribute; Counting Unit Cubes',
        description: 'Recognize volume as an attribute of solid figures; measure volume by counting unit cubes (cubic cm, cubic in, cubic ft).',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'A cube with side length 1 unit has "one cubic unit" of volume',
          'Solid figures packed without gaps or overlaps have volume equal to the number of unit cubes',
          'Layering strategy: base layer × number of layers'
        ]
      },
      {
        code: 'NC.5.MD.5',
        domainId: 'MD',
        title: 'Volume Formulas & Composed Rectangular Prisms',
        description: 'Relate volume to multiplication and addition; apply V = l × w × h and V = B × h; calculate volume of composite non-overlapping rectangular prisms.',
        weightCategory: 'High Priority (MD & G share 19–23%)',
        keyConcepts: [
          'Formulas: Volume = length × width × height = Base Area × height (V = B × h)',
          'Finding missing dimensions when given total volume and two dimensions',
          'Decomposing L-shaped or stepped composite 3D figures into two prisms and adding volumes'
        ]
      }
    ]
  },
  {
    id: 'OA',
    name: 'Operations & Algebraic Thinking',
    shortName: 'Algebraic Thinking',
    parentName: 'Expressions & patterns',
    officialWeightRange: '9–13%',
    officialWeightMidpoint: 11,
    color: 'violet',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
    description: 'Covers numerical expressions with parentheses, order of operations, properties of operations, and generating/graphing numerical patterns.',
    standards: [
      {
        code: 'NC.5.OA.2',
        domainId: 'OA',
        title: 'Numerical Expressions, Order of Operations & Properties',
        description: 'Write, explain, and evaluate numerical expressions with the four operations (up to two steps), including parentheses; commutative, associative, distributive properties.',
        weightCategory: 'Core (OA band 9–13%)',
        keyConcepts: [
          'Order of Operations with parentheses and at most two operations: parentheses first, then multiplication & division (left to right), then addition & subtraction (left to right)',
          'Translating word phrases into expressions: "Add 9 and 7, then multiply by 3" -> 3 × (9 + 7)',
          'Interpreting expressions without evaluating: 3 × (14,285 + 710) is three times as large as (14,285 + 710)',
          'Distributive property: a × (b + c) = (a × b) + (a × c)'
        ]
      },
      {
        code: 'NC.5.OA.3',
        domainId: 'OA',
        title: 'Generate Two Numerical Patterns & Graph Ordered Pairs',
        description: 'Generate two numerical patterns using two given rules; identify relationships between corresponding terms; form ordered pairs; graph them on a coordinate plane.',
        weightCategory: 'Core (OA band 9–13%)',
        keyConcepts: [
          'Generating terms: Rule 1 (add 3 starting at 0: 0, 3, 6, 9) and Rule 2 (add 6 starting at 0: 0, 6, 12, 18)',
          'Identifying the multiplicative relationship: terms in Rule 2 are twice the terms in Rule 1',
          'Forming ordered pairs (x, y) and plotting on the coordinate plane'
        ]
      }
    ]
  },
  {
    id: 'G',
    name: 'Geometry',
    shortName: 'Coordinate Geometry',
    parentName: 'Graphing & shapes',
    officialWeightRange: '19–23%',
    officialWeightMidpoint: 21,
    weightGroup: 'MD+G',
    weightGroupLabel: 'Measurement & Data and Geometry combined',
    color: 'rose',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Graphing and interpreting points in Quadrant 1 of the coordinate plane, and classifying two-dimensional figures in a hierarchy of properties.',
    standards: [
      {
        code: 'NC.5.G.1',
        domainId: 'G',
        title: 'Coordinate Plane & Quadrant 1 Coordinates',
        description: 'Graph points in the first quadrant of the coordinate plane; interpret the coordinate values in context of the situation (horizontal x-axis, vertical y-axis, origin).',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'Origin (0,0) as starting intersection of x-axis and y-axis',
          'In ordered pair (x, y), first number indicates horizontal move, second number indicates vertical move',
          'Calculating horizontal and vertical distances between points sharing an x or y coordinate',
          'Real-world coordinate maps and path distances'
        ]
      },
      {
        code: 'NC.5.G.3',
        domainId: 'G',
        title: 'Classify Quadrilaterals by Properties in a Hierarchy',
        description: 'Understand that attributes belonging to a category of 2D figures also belong to all subcategories; classify quadrilaterals by properties in a hierarchy.',
        weightCategory: 'Core (MD & G share 19–23%)',
        keyConcepts: [
          'Quadrilateral hierarchy: Polygons -> Quadrilaterals -> Parallelograms -> Rectangles & Rhombuses -> Squares; Trapezoids are a separate branch (NC definition: exactly one pair of parallel sides)',
          'All squares are rectangles and rhombuses, but not all rectangles are squares',
          'Parallelogram properties: 2 pairs of parallel sides, opposite sides congruent, opposite angles congruent',
          'Rhombus properties: 4 equal sides; Rectangle properties: 4 right angles'
        ]
      }
    ]
  }
];

// Helper to look up a standard by its code
export const GRADE_5_STANDARDS: StandardInfo[] = GRADE_5_DOMAINS.flatMap(d => d.standards);

export function getStandardByCode(code: string): StandardInfo | undefined {
  return GRADE_5_STANDARDS.find(s => s.code === code);
}

export function getDomainById(id: string): DomainInfo | undefined {
  return GRADE_5_DOMAINS.find(d => d.id === id);
}
