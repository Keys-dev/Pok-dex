import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";

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

  useEffect(() => {
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
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

      if (!res.ok) { // ✅ handle 404 from API
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

  // ✅ show search result if present, otherwise show default list
  const displayList = searchResult ? [searchResult] : pokemons;

  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>

      {/* ✅ Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text === "") clearSearch();
          }}
          onSubmitEditing={handleSearch} // ✅ search on keyboard "done"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ States */}
      {searching && <ActivityIndicator size="large" />}
      {notFound && <Text style={styles.notFound}>Pokémon not found. Try another name!</Text>}

      {/* ✅ List */}
      {displayList.map((pokemon) => {
        const primaryType = pokemon.types[0].type.name;
        const bgColor = colorsByType[primaryType] ?? "#ccc";

        return (
          <Link
            key={pokemon.name}
            href={{ pathname: "/details", params: { name: pokemon.name } }}
            style={{ borderRadius: 20 }}
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
                <Image source={{ uri: pokemon.image }} style={{ width: 150, height: 150 }} />
                <Image source={{ uri: pokemon.imageBack }} style={{ width: 150, height: 150 }} />
              </View>
            </View>
          </Link>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  card: {
    padding: 20,
    borderRadius: 20,
    width: "100%",
  },
  name: {
    fontSize: 28,
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
});