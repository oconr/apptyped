export type BaseDocument = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
};

export type MappingType<ReadType> = Record<
  keyof Omit<
    ReadType,
    | "$id"
    | "$collectionId"
    | "$databaseId"
    | "$createdAt"
    | "$updatedAt"
    | "$permissions"
  >,
  string
>;

export type MapType<ReadType> = Record<keyof ReadType, string>;
