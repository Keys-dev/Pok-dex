import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image, ScrollView, Text, View, StyleSheet,
  TextInput, TouchableOpacity, ActivityIndicator, useWindowDimensions
} from "react-native";

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

export const colorsByType: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { width } = useWindowDimensions(); // ✅ track screen width

  // ✅ responsive breakpoints
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
  const maxWidth = isDesktop ? 1200 : isTablet ? 800 : "100%";

  useEffect(() => {
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=25");
      const data = await response.json();

      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
          };
        })
      );

      setPokemons(detailedPokemons);
    } catch (error) {
      console.error("Error fetching pokemons:", error);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setNotFound(false);
    setSearchResult(null);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase().trim()}`);

      if (!res.ok) {
        setNotFound(true);
        return;
      }

      const data = await res.json();
      setSearchResult({
        name: data.name,
        image: data.sprites.front_default,
        imageBack: data.sprites.back_default,
        types: data.types,
      });
    } catch (error) {
      setNotFound(true);
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchResult(null);
    setNotFound(false);
  }

  const displayList = searchResult ? [searchResult] : pokemons;

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent]}>

      {/* ✅ Centered container with max width */}
      <View style={[styles.container, { maxWidth: maxWidth as any }]}>

        {/* Title */}
        <Text style={styles.title}>Pokédex</Text>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === "") clearSearch();
            }}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {searching && <ActivityIndicator size="large" />}
        {notFound && <Text style={styles.notFound}>Pokémon not found. Try another name!</Text>}

        {/* ✅ Responsive grid */}
        <View style={[styles.grid, { gap: 16 }]}>
          {displayList.map((pokemon) => {
            const primaryType = pokemon.types[0].type.name;
            const bgColor = colorsByType[primaryType] ?? "#ccc";

            return (
              <Link
                key={pokemon.name}
                href={{ pathname: "/details", params: { name: pokemon.name } }}
                style={[
                  styles.linkWrapper,
                  {
                    // ✅ divide into columns with gap accounted for
                    width: numColumns === 1
                      ? "100%"
                      : `${(100 / numColumns) - 2}%`,
                  }
                ]}
              >
                <View style={[styles.card, { backgroundColor: bgColor + "50" }]}>
                  <Text style={styles.name}>{pokemon.name}</Text>

                  <View style={styles.badgeRow}>
                    {pokemon.types.map((t) => (
                      <View
                        key={t.type.name}
                        style={[styles.badge, { backgroundColor: colorsByType[t.type.name] ?? "#ccc" }]}
                      >
                        <Text style={styles.badgeText}>{t.type.name}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                    <Image source={{ uri: pokemon.image }} style={styles.sprite} />
                    <Image source={{ uri: pokemon.imageBack }} style={styles.sprite} />
                  </View>
                </View>
              </Link>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  notFound: {
    textAlign: "center",
    color: "gray",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",  // ✅ wraps into grid
    justifyContent: "space-between",
  },
  linkWrapper: {
    borderRadius: 20,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    width: "100%",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "capitalize",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  sprite: {
    width: 100,
    height: 100,
  },
});