import type { ClientSDK } from "@sitecore-marketplace-sdk/client";
import type { MediaSelection } from "../types/crop";

type FieldItem = { name?: string; value?: string };

function extractMediaUrl(fields: FieldItem[] | undefined): string | undefined {
  if (!fields) return undefined;
  const mediaField = fields.find((f) =>
    f?.name ? ["mediaurl", "media url", "media path", "path"].includes(f.name.toLowerCase()) : false
  );
  return mediaField?.value;
}

export async function searchMedia(
  client: ClientSDK,
  rootPath: string,
  searchTerm: string,
  language: string
): Promise<MediaSelection[]> {
  const query = `
    query FindMedia($rootPath: String!, $searchTerm: String!, $language: String!) {
      search(
        where: {
          AND: [
            { name: "_path", value: $rootPath, operator: UNDER }
            { name: "name", value: $searchTerm, operator: CONTAINS }
          ]
        }
        language: $language
        first: 20
      ) {
        results {
          item {
            id
            name
            path
            mediaUrl
            ... on MediaItem {
              mediaUrl
            }
            fields(ownFields: false) {
              name
              value
            }
          }
        }
      }
    }
  `;

  const response: any = await client.query("xmc.graphql.authoring" as any, {
    params: {
      query,
      variables: { rootPath, searchTerm, language },
    },
  });

  const results = response?.data?.search?.results ?? [];

  return results
    .map((r: any) => {
      const fields = r?.item?.fields as FieldItem[] | undefined;
      const mediaUrl = r?.item?.mediaUrl ?? extractMediaUrl(fields);
      return {
        id: r?.item?.id,
        name: r?.item?.name,
        path: r?.item?.path,
        mediaUrl,
      };
    })
    .filter((r: MediaSelection) => Boolean(r.id));
}
