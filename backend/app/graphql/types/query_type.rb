# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    field :current_user, Types::UserType, null: true
    field :environments, [Types::EnvironmentType], null: false

    field :invite, [Types::InviteType], null: true

    field :environment, Types::EnvironmentType, null: true do
      argument :id, ID, required: true
    end
    

    field :environment_files, [Types::EnvironmentFileType], null: false do
      argument :environment_id, ID, required: true
    end

    def environments
      return [] unless context[:current_user]
      context[:current_user].environments
    end

    def environment(id:)
      return nil unless context[:current_user]
      environment = Environment.find(id)
      return nil if environment.nil? || EnvironmentUserJoin.find_by(environment_id: id, user_id: context[:current_user].id).nil?
      environment
    end

    def environment_files(environment_id:)
      return [] unless context[:current_user]
      environment = Environment.find(environment_id)
      return [] if environment.nil? || EnvironmentUserJoin.find_by(environment_id: environment_id, user_id: context[:current_user].id).nil?
      environment.environment_files
    end

    def current_user
      context[:current_user]
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    # TODO: remove me
    field :test_field, String, null: false,
      description: "An example field added by the generator"
    def test_field
      "Hello World!"
    end
  end
end
