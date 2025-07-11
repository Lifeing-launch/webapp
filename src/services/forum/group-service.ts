import { BaseForumService } from "./base-forum-service";
import {
  ForumGroup,
  GroupMember,
  GroupWithDetails,
  GroupMemberWithDetails,
  GroupTypeEnum,
} from "@/typing/forum";

export class GroupService extends BaseForumService {
  /**
   * Fetch groups with optional filters
   */
  async getGroups(
    options: {
      groupType?: GroupTypeEnum;
      search?: string;
      limit?: number;
      offset?: number;
      joinedOnly?: boolean;
    } = {}
  ): Promise<GroupWithDetails[]> {
    try {
      const {
        groupType,
        search,
        limit = 100,
        offset = 0,
        joinedOnly = false,
      } = options;

      let query = this.supabase.from("groups").select(`
        *,
        owner_profile:anonymous_profiles!groups_owner_anon_id_fkey(id, nickname, created_at)
      `);

      if (groupType) {
        query = query.eq("group_type", groupType);
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      const profile = await this.getCurrentProfile();

      if (joinedOnly && profile) {
        // Fetch groups where user is an approved member only
        const { data: memberGroups } = await this.supabase
          .from("group_members")
          .select("group_id")
          .eq("anon_profile_id", profile.id)
          .eq("is_approved", true);

        if (!memberGroups || memberGroups.length === 0) {
          return [];
        }

        const groupIds = memberGroups.map((m) => m.group_id);
        query = query.in("id", groupIds);
      }

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: rawGroups, error } = await query;

      if (error) {
        this.handleError(error, "fetch groups");
      }

      if (!rawGroups || rawGroups.length === 0) {
        return [];
      }

      // Get group IDs for additional queries
      const groupIds = rawGroups.map((group) => group.id);

      // Get approved members count for each group
      const { data: membersCount } = await this.supabase
        .from("group_members")
        .select("group_id")
        .eq("is_approved", true)
        .in("group_id", groupIds);

      // Create a map of group_id to approved members count
      const membersCountMap = new Map<string, number>();
      membersCount?.forEach((member) => {
        const currentCount = membersCountMap.get(member.group_id) || 0;
        membersCountMap.set(member.group_id, currentCount + 1);
      });

      // Check current user's membership status
      const userMemberships = new Map<
        string,
        { isMember: boolean; status?: string }
      >();

      if (profile) {
        const { data: memberships } = await this.supabase
          .from("group_members")
          .select("group_id, is_approved")
          .eq("anon_profile_id", profile.id)
          .in("group_id", groupIds);

        memberships?.forEach((m) => {
          userMemberships.set(m.group_id, {
            isMember: m.is_approved,
            status: m.is_approved ? "approved" : "pending",
          });
        });
      }

      const groupsWithDetails: GroupWithDetails[] = rawGroups.map(
        (rawGroup) => {
          const membershipInfo = userMemberships.get(rawGroup.id) || {
            isMember: false,
          };

          return {
            id: rawGroup.id,
            name: rawGroup.name,
            description: rawGroup.description,
            group_type: rawGroup.group_type,
            owner_anon_id: rawGroup.owner_anon_id,
            created_at: rawGroup.created_at,
            owner_profile: rawGroup.owner_profile,
            members_count: membersCountMap.get(rawGroup.id) || 0,
            is_member: membershipInfo.isMember,
            is_owner: profile ? rawGroup.owner_anon_id === profile.id : false,
            isJoined: membershipInfo.isMember,
            member_status: membershipInfo.status as
              | "pending"
              | "approved"
              | undefined,
          } as GroupWithDetails;
        }
      );

      return groupsWithDetails;
    } catch (error) {
      this.handleError(error, "fetch groups");
    }
  }

  /**
   * Fetch group by ID
   */
  async getGroupById(groupId: string): Promise<GroupWithDetails | null> {
    try {
      const { data: rawGroup, error } = await this.supabase
        .from("groups")
        .select(
          `
          *,
          owner_profile:anonymous_profiles!groups_owner_anon_id_fkey(id, nickname, created_at)
        `
        )
        .eq("id", groupId)
        .single();

      if (error) {
        this.handleError(error, "fetch group by id");
      }

      if (!rawGroup) {
        return null;
      }

      // Get approved members count for this group
      const { data: membersCount } = await this.supabase
        .from("group_members")
        .select("anon_profile_id", { count: "exact" })
        .eq("group_id", groupId)
        .eq("is_approved", true);

      // Check current user's membership status
      const profile = await this.getCurrentProfile();
      let membershipInfo: {
        isMember: boolean;
        status?: "pending" | "approved";
      } = {
        isMember: false,
        status: undefined,
      };

      if (profile) {
        const { data: membership } = await this.supabase
          .from("group_members")
          .select("is_approved")
          .eq("anon_profile_id", profile.id)
          .eq("group_id", groupId)
          .maybeSingle();

        if (membership) {
          membershipInfo = {
            isMember: membership.is_approved,
            status: membership.is_approved ? "approved" : "pending",
          };
        }
      }

      return {
        id: rawGroup.id,
        name: rawGroup.name,
        description: rawGroup.description,
        group_type: rawGroup.group_type,
        owner_anon_id: rawGroup.owner_anon_id,
        created_at: rawGroup.created_at,
        owner_profile: rawGroup.owner_profile,
        members_count: membersCount?.length || 0,
        is_member: membershipInfo.isMember,
        is_owner: profile ? rawGroup.owner_anon_id === profile.id : false,
        isJoined: membershipInfo.isMember,
        member_status: membershipInfo.status as
          | "pending"
          | "approved"
          | undefined,
      } as GroupWithDetails;
    } catch (error) {
      this.handleError(error, "fetch group by id");
    }
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: {
    name: string;
    description?: string;
    groupType?: GroupTypeEnum;
  }): Promise<ForumGroup> {
    try {
      const { name, description, groupType = "public" } = groupData;
      const profile = await this.requireProfile();

      const { data: group, error } = await this.supabase
        .from("groups")
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          group_type: groupType,
          owner_anon_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, "create group");
      }

      if (!group) {
        throw new Error("Failed to create group: group data is null.");
      }

      // Automatically add the owner as an approved member
      await this.supabase.from("group_members").insert({
        anon_profile_id: profile.id,
        group_id: group.id,
        is_approved: true,
        role: "owner",
      });

      return group;
    } catch (error) {
      this.handleError(error, "create group");
    }
  }

  /**
   * Request to join a group
   */
  async joinGroup(groupId: string): Promise<GroupMember> {
    try {
      const profile = await this.requireProfile();

      // Check if a request already exists
      const { data: existingMembership } = await this.supabase
        .from("group_members")
        .select("*")
        .eq("anon_profile_id", profile.id)
        .eq("group_id", groupId)
        .maybeSingle();

      if (existingMembership) {
        if (existingMembership.is_approved) {
          throw new Error("You are already a member of this group.");
        } else {
          throw new Error("You have already requested to join this group.");
        }
      }

      // Check if group exists and its type
      const { data: group } = await this.supabase
        .from("groups")
        .select("group_type")
        .eq("id", groupId)
        .single();

      if (!group) {
        throw new Error("Group not found.");
      }

      const { data: membership, error } = await this.supabase
        .from("group_members")
        .insert({
          anon_profile_id: profile.id,
          group_id: groupId,
          is_approved: group.group_type === "public", // Auto-approve for public groups
          role: "member",
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, "join group");
      }

      return membership;
    } catch (error) {
      this.handleError(error, "join group");
    }
  }

  /**
   * Approve group member (owner only)
   */
  async approveGroupMember(groupId: string, memberId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      // Check if user is group owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (!group || group.owner_anon_id !== profile.id) {
        throw new Error(
          "You do not have permission to approve members in this group."
        );
      }

      const { error } = await this.supabase
        .from("group_members")
        .update({ is_approved: true })
        .eq("group_id", groupId)
        .eq("anon_profile_id", memberId);

      if (error) {
        this.handleError(error, "approve group member");
      }
    } catch (error) {
      this.handleError(error, "approve group member");
    }
  }

  /**
   * Remove group member (owner only)
   */
  async removeGroupMember(groupId: string, memberId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      // Check if user is group owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (!group || group.owner_anon_id !== profile.id) {
        throw new Error(
          "You do not have permission to remove members from this group."
        );
      }

      // Don't allow removing the owner
      if (memberId === profile.id) {
        throw new Error("You cannot remove yourself as the owner.");
      }

      const { error } = await this.supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("anon_profile_id", memberId);

      if (error) {
        this.handleError(error, "remove group member");
      }
    } catch (error) {
      this.handleError(error, "remove group member");
    }
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      // Check if user is not the owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (group && group.owner_anon_id === profile.id) {
        throw new Error(
          "You cannot leave a group you own. Transfer ownership or delete the group instead."
        );
      }

      const { error } = await this.supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("anon_profile_id", profile.id);

      if (error) {
        this.handleError(error, "leave group");
      }
    } catch (error) {
      this.handleError(error, "leave group");
    }
  }

  /**
   * Fetch group members
   */
  async getGroupMembers(
    groupId: string,
    options: {
      limit?: number;
      offset?: number;
      onlyApproved?: boolean;
    } = {}
  ): Promise<GroupMemberWithDetails[]> {
    try {
      const { limit = 20, offset = 0, onlyApproved = true } = options;

      let query = this.supabase
        .from("group_members")
        .select(
          `
          *,
          profile:anonymous_profiles!group_members_anon_profile_id_fkey(id, nickname, created_at),
          group:groups!group_members_group_id_fkey(id, name, description)
        `
        )
        .eq("group_id", groupId);

      if (onlyApproved) {
        query = query.eq("is_approved", true);
      }

      const { data: members, error } = await query.range(
        offset,
        offset + limit - 1
      );

      if (error) {
        this.handleError(error, "fetch group members");
      }

      return members || [];
    } catch (error) {
      this.handleError(error, "fetch group members");
    }
  }

  /**
   * Check user membership in a group
   */
  async getGroupMembership(groupId: string): Promise<GroupMember | null> {
    try {
      const profile = await this.getCurrentProfile();

      if (!profile) {
        return null;
      }

      const { data: membership, error } = await this.supabase
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("anon_profile_id", profile.id)
        .maybeSingle();

      if (error) {
        this.handleError(error, "fetch group membership");
      }

      return membership;
    } catch (error) {
      this.handleError(error, "fetch group membership");
    }
  }

  /**
   * Update group (owner only)
   */
  async updateGroup(
    groupId: string,
    updateData: {
      name?: string;
      description?: string;
      groupType?: GroupTypeEnum;
    }
  ): Promise<ForumGroup> {
    try {
      const profile = await this.requireProfile();

      // Check if user is group owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (!group || group.owner_anon_id !== profile.id) {
        throw new Error("You do not have permission to update this group.");
      }

      const updateFields: Record<string, string | null> = {};
      if (updateData.name) updateFields.name = updateData.name.trim();
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description?.trim() || null;
      }
      if (updateData.groupType) updateFields.group_type = updateData.groupType;

      const { data: updatedGroup, error } = await this.supabase
        .from("groups")
        .update(updateFields)
        .eq("id", groupId)
        .select()
        .single();

      if (error) {
        this.handleError(error, "update group");
      }

      return updatedGroup;
    } catch (error) {
      this.handleError(error, "update group");
    }
  }

  /**
   * Delete group (owner only)
   */
  async deleteGroup(groupId: string): Promise<void> {
    try {
      const profile = await this.requireProfile();

      // Check if user is group owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (!group || group.owner_anon_id !== profile.id) {
        throw new Error("You do not have permission to delete this group.");
      }

      const { error } = await this.supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (error) {
        this.handleError(error, "delete group");
      }
    } catch (error) {
      this.handleError(error, "delete group");
    }
  }

  /**
   * Fetch pending membership requests (owner only)
   */
  async getPendingJoinRequests(
    groupId: string
  ): Promise<GroupMemberWithDetails[]> {
    try {
      const profile = await this.requireProfile();

      // Check if user is group owner
      const { data: group } = await this.supabase
        .from("groups")
        .select("owner_anon_id")
        .eq("id", groupId)
        .single();

      if (!group || group.owner_anon_id !== profile.id) {
        throw new Error(
          "You do not have permission to view join requests for this group."
        );
      }

      const { data: requests, error } = await this.supabase
        .from("group_members")
        .select(
          `
          *,
          profile:anonymous_profiles!group_members_anon_profile_id_fkey(id, nickname, created_at),
          group:groups!group_members_group_id_fkey(id, name, description)
        `
        )
        .eq("group_id", groupId)
        .eq("is_approved", false);

      if (error) {
        this.handleError(error, "fetch pending join requests");
      }

      return requests || [];
    } catch (error) {
      this.handleError(error, "fetch pending join requests");
    }
  }

  /**
   * Fetch all pending membership requests for groups owned by current user
   */
  async getAllPendingJoinRequests(): Promise<GroupMemberWithDetails[]> {
    try {
      const profile = await this.requireProfile();

      // Get all groups owned by current user
      const { data: ownedGroups, error: groupsError } = await this.supabase
        .from("groups")
        .select("id")
        .eq("owner_anon_id", profile.id);

      if (groupsError) {
        this.handleError(groupsError, "fetch owned groups");
      }

      if (!ownedGroups || ownedGroups.length === 0) {
        return [];
      }

      const groupIds = ownedGroups.map((g) => g.id);

      // Get all pending requests for owned groups
      const { data: requests, error } = await this.supabase
        .from("group_members")
        .select(
          `
          *,
          profile:anonymous_profiles!group_members_anon_profile_id_fkey(id, nickname, created_at),
          group:groups!group_members_group_id_fkey(id, name, description)
        `
        )
        .in("group_id", groupIds)
        .eq("is_approved", false);

      if (error) {
        this.handleError(error, "fetch all pending join requests");
      }

      return requests || [];
    } catch (error) {
      this.handleError(error, "fetch all pending join requests");
    }
  }
}

export const groupService = new GroupService();
