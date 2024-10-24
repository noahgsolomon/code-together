# frozen_string_literal: true

module Types
  class EnvironmentType < Types::BaseObject
    field :id, ID, null: false
    field :name, String
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    field :environment_files, [Types::EnvironmentFileType], null: false

    def environment_files
      object.environment_files
    end
  end
end
