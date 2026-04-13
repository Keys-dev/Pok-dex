import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, Image, View, TouchableOpacity } from "react-native";
import { colorsByType } from "./index"; // ✅ reuse shared colors

interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
  stats: PokemonStat[]; // ✅ added stats
}

export default function Details() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const { name } = useLocalSearchParams();
  const router = useRouter(); // ✅ for back navigation

  useEffect(() => {
    fetchPokemonByName(name as string).then((data) => {
      if (!data) return;
      setPokemon({
        name: data.name,
        image: data.sprites.front_default,
        imageBack: data.sprites.back_default,
        types: data.types,
        stats: data.stats, // ✅ store stats
      });
    });
  }, [name]);

  async function fetchPokemonByName(name: string) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pokemon details:", error);
    }
  }

  if (!pokemon) return <Text style={{ padding: 20 }}>Loading...</Text>;

  const primaryType = pokemon.types[0].type.name;
  const bgColor = colorsByType[primaryType] ?? "#ccc";

  return (
    <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>

      {/* ✅ Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header card */}
      <View style={[styles.card, { backgroundColor: bgColor + "50" }]}>
        <Text style={styles.name}>{pokemon.name}</Text>

        {/* ✅ Type badges */}
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

      {/* ✅ Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Base Stats</Text>
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{s.stat.name}</Text>
            <View style={styles.statBarBg}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                    backgroundColor: bgColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.statValue}>{s.base_stat}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  card: {
    padding: 20,
    borderRadius: 20,
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
  statsCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statName: {
    width: 90,
    fontSize: 12,
    textTransform: "capitalize",
    color: "#555",
  },
  statBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: 10,
  },
  statValue: {
    width: 30,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
});