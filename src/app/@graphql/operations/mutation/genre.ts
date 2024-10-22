import gql from "graphql-tag";
import { GENRE_FRAGMENT } from "@graphql/operations/fragment/genre";

export const ADD_GENRE = gql`
    mutation insertarGenero($genre: String!) {
        addGenre(genre: $genre) {
            status
            message
            genre {
                ...GenreObject
            }
        }
    }
    ${ GENRE_FRAGMENT }
`;

export const MODIFY_GENRE = gql`
    mutation modificarGenero($id: ID!, $genre: String!) {
        updateGenre(id: $id, genre: $genre) {
            status
            message
            genre {
                ...GenreObject
            }
        }
    }
    ${ GENRE_FRAGMENT }
`;


export const BLOCK_GENRE = gql`
    mutation bloquearGenero($id: ID!) {
        blockGenre(id: $id) {
            status
            message
        }
    }
`;