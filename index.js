const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema, GraphQLEnumType } = require("graphql");
const fs = require("fs");
const textSchema = fs.readFileSync("schema.graphql", "utf-8");

const app = express();
let expression = "hello";
const MyGraphQLSchema = buildSchema(textSchema);

const greeting = args => {
  console.log(args.expression);
  expression = args.expression;
  return args.expression;
};
const dog = {
  name: () => "fido"
};
const breedType = new GraphQLEnumType({
  name: "BreedEnum",
  values: {
    WOLF: {
      value: 0
    },
    LAB: {
      value: 1
    }
  }
});

const catBreedType = new GraphQLEnumType({
  name: "CatBreedType",
  values: {
    GINGER: {
      value: 0
    },
    TOM: {
      value: 0
    }
  }
});

const WoofWoof = {
  breed: (_, { req, res }) => {
    console.log(req.baseUrl);
    return breedType.getValue("WOLF").name;
  },
  dog: dog,
	other: () => "other",
	vertibrate: () => true
};

const MeowMeow = {
  breed: () => {
    return catBreedType.getValue("GINGER").name;
  },
	eyes: "blue",
	vertibrate: () => true
};

const Animal = {
  __resolveType(obj) {
    console.log("resolve type called");
    if (obj.dog) {
      return "WoofWoof";
    }
    if (obj.eyes) {
      return "MeowMeow";
    }
    return null;
  }
};
// comment this
const root = {
  hello({ arg1 }) {
    console.log("test root");
    return arg1;
  },
  bye: () => expression,
  theDog: dog,
  greeting: greeting,
  canine: WoofWoof,
  animals: () => {
    return [
      {
        __typename: "MeowMeow",
        breed: catBreedType.getValue("GINGER").name,
				eyes: "brown",
				vertibrate: true
      }
    ];
  }
};

app.use(
  "/graphql",
  graphqlHTTP((req, res) => ({
    schema: MyGraphQLSchema,
    rootValue: root,
    graphiql: true,
    context: { req, res }
  }))
);

app.listen(4000);
